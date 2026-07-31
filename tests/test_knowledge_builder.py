import tempfile
import unittest
from pathlib import Path

from chromadb.api.client import SharedSystemClient
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings

from min_agent.knowledge import ChromaKnowledgeBase
from min_agent.knowledge_builder import KnowledgeBuilder, approximate_token_count


class KeywordEmbeddings(Embeddings):
    terms = ("主营", "服饰", "库存", "入库", "生产", "裁剪", "FAQ")

    def __init__(self):
        self.document_calls = 0

    def _vector(self, text):
        return [float(text.count(term)) for term in self.terms] + [1.0]

    def embed_documents(self, texts):
        self.document_calls += 1
        return [self._vector(text) for text in texts]

    def embed_query(self, text):
        return self._vector(text)


class KnowledgeBuilderTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.source = self.root / "source"
        self.docs = self.root / "knowledge_base" / "docs"
        self.chroma = self.root / "knowledge_base" / "chroma_db"
        self.source.mkdir()
        self.embeddings = KeywordEmbeddings()
        self.builders = []

    def tearDown(self):
        for builder in self.builders:
            builder.close()
        SharedSystemClient.clear_system_cache()
        self.temp.cleanup()

    def builder(self):
        builder = KnowledgeBuilder(
            source_directory=self.source,
            documents_directory=self.docs,
            chroma_directory=self.chroma,
            collection_name="test-huachen",
            dashscope_api_key="test-key",
            embedding_model="text-embedding-v3",
            chunk_size=500,
            chunk_overlap=100,
            embeddings=self.embeddings,
        )
        self.builders.append(builder)
        return builder

    def test_scan_load_split_and_metadata(self):
        (self.source / "华辰服饰有限公司_公司介绍.md").write_text(
            "# 公司介绍\n\n华辰服饰有限公司主营服装设计、生产与销售。",
            encoding="utf-8",
        )
        builder = self.builder()
        paths = builder.prepared_document_paths()
        documents = builder.load_documents(paths)
        chunks = builder.split_documents(documents)

        self.assertEqual([path.name for path in paths], ["华辰服饰有限公司_公司介绍.md"])
        self.assertEqual(chunks[0].metadata["source"], "华辰服饰有限公司_公司介绍.md")
        self.assertEqual(chunks[0].metadata["category"], "公司介绍")
        self.assertEqual(chunks[0].metadata["company"], "华辰服饰有限公司")
        self.assertEqual(chunks[0].metadata["chunk_index"], 0)

    def test_splitter_uses_500_token_chunks_with_100_token_overlap(self):
        builder = self.builder()
        document = Document(
            page_content=("华辰服饰生产流程包括设计、裁剪、缝制、质检和入库。" * 300),
            metadata={
                "source": "华辰服饰有限公司_生产流程.pdf",
                "category": "生产流程",
                "company": "华辰服饰有限公司",
            },
        )
        chunks = builder.split_documents([document])
        self.assertGreater(len(chunks), 1)
        self.assertTrue(all(approximate_token_count(chunk.page_content) <= 500 for chunk in chunks))
        self.assertEqual(builder.text_splitter()._chunk_overlap, 100)

    def test_existing_chroma_is_loaded_without_reembedding(self):
        (self.source / "华辰服饰有限公司_FAQ.md").write_text(
            "FAQ：支持七天无理由退换货。",
            encoding="utf-8",
        )
        builder = self.builder()
        builder.build()
        calls_after_build = self.embeddings.document_calls

        loaded = builder.ensure_vector_store(auto_build=True)

        self.assertTrue(builder._has_documents(loaded))
        self.assertEqual(self.embeddings.document_calls, calls_after_build)

    def test_required_enterprise_queries_retrieve_expected_sources(self):
        builder = self.builder()
        vector_store = builder.create_vector_store()
        documents = [
            Document(
                page_content="华辰服饰公司的主营业务是服装设计、生产、销售与供应链服务。",
                metadata={
                    "source": "华辰服饰有限公司_公司介绍.md",
                    "category": "公司介绍",
                    "company": "华辰服饰有限公司",
                },
            ),
            Document(
                page_content="库存管理流程包括采购入库、质检、库位分配、盘点和出库。",
                metadata={
                    "source": "华辰服饰有限公司_库存管理.pdf",
                    "category": "库存管理",
                    "company": "华辰服饰有限公司",
                },
            ),
            Document(
                page_content="生产流程包括设计打版、面料采购、裁剪、缝制、质检和包装。",
                metadata={
                    "source": "华辰服饰有限公司_生产流程.pdf",
                    "category": "生产流程",
                    "company": "华辰服饰有限公司",
                },
            ),
        ]
        builder.index_documents(vector_store, documents)
        knowledge = ChromaKnowledgeBase(builder, vector_store, top_k=1)

        cases = {
            "华辰服饰公司的主营业务是什么？": "华辰服饰有限公司_公司介绍.md",
            "库存管理流程是什么？": "华辰服饰有限公司_库存管理.pdf",
            "生产流程有哪些步骤？": "华辰服饰有限公司_生产流程.pdf",
        }
        for query, expected_source in cases.items():
            with self.subTest(query=query):
                self.assertEqual(knowledge.search(query, limit=1)[0].filename, expected_source)

    def test_reindex_replaces_old_chunks_for_the_same_source(self):
        builder = self.builder()
        vector_store = builder.create_vector_store()
        metadata = {
            "source": "华辰服饰有限公司_FAQ.md",
            "category": "FAQ",
            "company": "华辰服饰有限公司",
        }
        builder.index_documents(
            vector_store,
            [Document(page_content="旧版退换货政策。", metadata=metadata)],
        )
        builder.index_documents(
            vector_store,
            [Document(page_content="新版支持七天无理由退换货。", metadata=metadata)],
        )
        stored = vector_store.get(where={"source": "华辰服饰有限公司_FAQ.md"})

        self.assertEqual(len(stored["ids"]), 1)
        self.assertEqual(stored["documents"], ["新版支持七天无理由退换货。"])


class ProvidedKnowledgeFilesTests(unittest.TestCase):
    source = Path(r"C:\Users\cui\Desktop\clothing_company_knowledge_base")

    @unittest.skipUnless(source.is_dir(), "provided enterprise knowledge directory is not available")
    def test_all_provided_markdown_and_pdf_files_are_loadable(self):
        with tempfile.TemporaryDirectory() as folder:
            builder = KnowledgeBuilder(
                source_directory=self.source,
                documents_directory=Path(folder) / "docs",
                chroma_directory=Path(folder) / "chroma",
                collection_name="provided-files-test",
                dashscope_api_key="test-key",
                embeddings=KeywordEmbeddings(),
            )
            paths = builder.prepared_document_paths()
            documents = builder.load_documents(paths)
            sources = {document.metadata["source"] for document in documents}

            self.assertEqual(len(paths), 5)
            self.assertIn("华辰服饰有限公司_公司介绍.md", sources)
            self.assertIn("华辰服饰有限公司_库存管理.pdf", sources)
            self.assertIn("华辰服饰有限公司_生产流程.pdf", sources)


if __name__ == "__main__":
    unittest.main()
