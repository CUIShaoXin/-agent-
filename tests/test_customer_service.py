import json
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from min_agent.api import create_app
from min_agent.config import Settings
from min_agent.customer_agent import ChatResult, CustomerServiceAgent
from min_agent.knowledge import KnowledgeHit, extract_document_text
from min_agent.mysql_database import MySQLDatabase
from min_agent.storage import SQLiteStore


def settings_for(folder: str, **overrides) -> Settings:
    values = {
        "openai_api_key": "test-key",
        "openai_model": "test-model",
        "embedding_model": "test-embedding",
        "dashscope_api_key": "test-dashscope-key",
        "dashscope_embedding_model": "text-embedding-v3",
        "dashscope_chat_model": "qwen-plus",
        "agent_db_path": str(Path(folder) / "agent.db"),
        "knowledge_db_path": str(Path(folder) / "knowledge.db"),
        "knowledge_source_dir": str(Path(folder) / "source"),
        "knowledge_docs_dir": str(Path(folder) / "knowledge_base" / "docs"),
        "chroma_db_path": str(Path(folder) / "knowledge_base" / "chroma_db"),
        "chroma_collection_name": "test-knowledge",
        "knowledge_chunk_size": 500,
        "knowledge_chunk_overlap": 100,
        "knowledge_auto_build": True,
        "context_messages": 12,
        "rag_top_k": 3,
        "rag_min_score": 0.45,
        "mysql_host": "",
        "mysql_port": 3306,
        "mysql_user": "",
        "mysql_password": "",
        "mysql_database": "",
        "mysql_allowed_tables": (),
        "mysql_max_rows": 100,
        "cors_origins": ("http://localhost:3000",),
        "max_upload_bytes": 1024 * 1024,
    }
    values.update(overrides)
    return Settings(**values)


class FakeLLM:
    def __init__(self, needs_database: bool = False) -> None:
        self.needs_database = needs_database
        self.answer_requests = []

    def embed(self, texts):
        return [[float(len(text)), float(sum(ord(char) for char in text) % 997), 1.0] for text in texts]

    def structured(self, instructions, input_text, *, name, schema, safety_identifier=None):
        if name == "customer_intent":
            return {
                "intent": "data" if self.needs_database else "knowledge",
                "needs_database": self.needs_database,
                "rewritten_query": input_text.split("当前问题：")[-1],
            }
        if name == "readonly_mysql_query":
            return {"sql": "SELECT name, revenue FROM sales"}
        raise AssertionError(f"unexpected structured call: {name}")

    def respond(self, instructions, input_items, *, reasoning_effort="low", safety_identifier=None):
        self.answer_requests.append(input_items)
        return "这是基于真实 Agent 流程生成的回答。"


class FakeDatabase:
    configured = True

    def schema_summary(self):
        return "sales(name varchar, revenue decimal)"

    def query(self, sql):
        return {"sql": sql, "row_count": 1, "rows": [{"name": "A", "revenue": 100}]}


class FakeKnowledgeBase:
    def __init__(self):
        self.documents = []

    def ingest(self, filename, data):
        content = extract_document_text(filename, data)
        self.documents = [(filename, content)]
        return {"document_id": "fake-doc", "filename": filename, "chunks": 1}

    def search(self, query, limit=5, min_score=0.0):
        return [
            KnowledgeHit(
                document_id=f"fake-{index}",
                filename=filename,
                content=content,
                score=1.0,
                metadata={
                    "source": filename,
                    "category": Path(filename).stem,
                    "company": "华辰服饰有限公司",
                },
            )
            for index, (filename, content) in enumerate(self.documents[:limit])
        ]

    def document_count(self):
        return len(self.documents)

    def chunk_count(self):
        return len(self.documents)

    def close(self):
        pass


class CustomerServiceTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.settings = settings_for(self.temp.name)
        self.store = SQLiteStore(self.settings.agent_db_path)
        self.knowledge = FakeKnowledgeBase()

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def test_rag_and_session_memory_are_used(self):
        llm = FakeLLM()
        self.knowledge.ingest("产品FAQ.md", "企业版支持私有化部署和多轮会话记忆。".encode())
        agent = CustomerServiceAgent(self.settings, llm, self.store, self.knowledge, FakeDatabase())

        first = agent.chat("支持私有化部署吗？", "window-1")
        second = agent.chat("刚才提到的方案支持什么？", "window-1")

        self.assertEqual(first.sources[0]["filename"], "产品FAQ.md")
        self.assertEqual(second.session_id, "window-1")
        final_history = llm.answer_requests[-1][0]["content"]
        self.assertIn("支持私有化部署吗", final_history)
        self.assertIn("真实 Agent 流程", final_history)

    def test_database_path_is_used_for_data_intent(self):
        llm = FakeLLM(needs_database=True)
        agent = CustomerServiceAgent(self.settings, llm, self.store, self.knowledge, FakeDatabase())
        result = agent.chat("销售额是多少？", "data-session")
        self.assertTrue(result.database_used)
        evidence = json.loads(llm.answer_requests[-1][1]["content"].split("本轮证据：\n", 1)[1])
        self.assertEqual(evidence["database"]["row_count"], 1)

    def test_mysql_guard_blocks_writes_and_adds_limit(self):
        database = MySQLDatabase(self.settings)
        with self.assertRaises(ValueError):
            database._validate("DELETE FROM sales")
        self.assertTrue(database._validate("SELECT * FROM sales").endswith("LIMIT 100"))

    def test_text_upload_extraction(self):
        self.assertEqual(extract_document_text("faq.md", "售后政策".encode()), "售后政策")

    def test_markdown_upload_is_chunked_embedded_and_searchable(self):
        llm = FakeLLM()
        agent = CustomerServiceAgent(self.settings, llm, self.store, self.knowledge, FakeDatabase())

        uploaded = agent.upload_knowledge(
            "企业售后政策.md",
            "# 售后政策\n\n企业版提供 7×24 小时支持，并支持私有化部署。".encode("utf-8"),
        )
        hits = self.knowledge.search("是否支持私有化部署？", limit=3)

        self.assertEqual(uploaded["filename"], "企业售后政策.md")
        self.assertGreaterEqual(uploaded["chunks"], 1)
        self.assertEqual(hits[0].filename, "企业售后政策.md")
        self.assertIn("私有化部署", hits[0].content)


class FakeApiAgent:
    def chat(self, message, session_id):
        return ChatResult("API answer", session_id, "knowledge", [], False)

    def health(self):
        return {"llm_configured": True}

    def upload_knowledge(self, filename, data):
        return {"document_id": "doc-1", "filename": filename, "chunks": 1}

    def close(self):
        pass


class ApiTests(unittest.TestCase):
    def test_github_pages_origin_is_allowed_by_cors(self):
        with tempfile.TemporaryDirectory() as folder:
            app = create_app(settings_for(folder, cors_origins=()))
            app.state.customer_agent = FakeApiAgent()
            with TestClient(app) as client:
                response = client.options(
                    "/chat",
                    headers={
                        "Origin": "https://cuishaoxin.github.io",
                        "Access-Control-Request-Method": "POST",
                        "Access-Control-Request-Headers": "content-type",
                    },
                )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(
                response.headers["access-control-allow-origin"],
                "https://cuishaoxin.github.io",
            )

    def test_post_chat_contract(self):
        with tempfile.TemporaryDirectory() as folder:
            app = create_app(settings_for(folder))
            app.state.customer_agent = FakeApiAgent()
            with TestClient(app) as client:
                response = client.post("/chat", json={"message": "你好", "session_id": "window-1"})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["answer"], "API answer")
            self.assertEqual(response.json()["session_id"], "window-1")

    def test_post_chat_generates_session_id_when_omitted(self):
        with tempfile.TemporaryDirectory() as folder:
            app = create_app(settings_for(folder))
            app.state.customer_agent = FakeApiAgent()
            with TestClient(app) as client:
                response = client.post("/chat", json={"message": "你好"})
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()["session_id"].startswith("api-"))

    def test_upload_contract(self):
        with tempfile.TemporaryDirectory() as folder:
            app = create_app(settings_for(folder))
            app.state.customer_agent = FakeApiAgent()
            with TestClient(app) as client:
                response = client.post(
                    "/knowledge/upload",
                    files={"file": ("faq.md", "企业售后政策".encode(), "text/markdown")},
                )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["chunks"], 1)


if __name__ == "__main__":
    unittest.main()
