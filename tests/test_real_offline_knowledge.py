"""Opt-in real DashScope + Chroma retrieval test for the provided enterprise files."""

import os
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path

from min_agent.config import Settings
from min_agent.knowledge import ChromaKnowledgeBase


SOURCE_DIRECTORY = Path(r"C:\Users\cui\Desktop\clothing_company_knowledge_base")


@unittest.skipUnless(
    os.getenv("RUN_OFFLINE_KB_TEST") == "1"
    and os.getenv("DASHSCOPE_API_KEY")
    and SOURCE_DIRECTORY.is_dir(),
    "real offline knowledge test is opt-in",
)
class RealOfflineKnowledgeTest(unittest.TestCase):
    def test_required_queries_retrieve_the_expected_enterprise_files(self):
        with tempfile.TemporaryDirectory() as folder:
            settings = replace(
                Settings.from_env(),
                knowledge_source_dir=str(SOURCE_DIRECTORY),
                knowledge_docs_dir=str(Path(folder) / "knowledge_base" / "docs"),
                chroma_db_path=str(Path(folder) / "knowledge_base" / "chroma_db"),
                chroma_collection_name="huachen-real-test",
                rag_top_k=3,
            )
            knowledge = ChromaKnowledgeBase.from_settings(settings)
            cases = {
                "华辰服饰公司的主营业务是什么？": "华辰服饰有限公司_公司介绍.md",
                "库存管理流程是什么？": "华辰服饰有限公司_库存管理.pdf",
                "生产流程有哪些步骤？": "华辰服饰有限公司_生产流程.pdf",
            }
            for query, expected_source in cases.items():
                with self.subTest(query=query):
                    sources = [hit.filename for hit in knowledge.search(query, limit=3)]
                    self.assertIn(expected_source, sources)


if __name__ == "__main__":
    unittest.main()
