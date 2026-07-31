from __future__ import annotations

import argparse
import hashlib
import json
import logging
import re
import shutil
from collections import defaultdict
from dataclasses import asdict, dataclass, replace
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from langchain_chroma import Chroma
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.embeddings import DashScopeEmbeddings
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import Settings

LOGGER = logging.getLogger(__name__)
SUPPORTED_SUFFIXES = frozenset({".md", ".pdf"})
DEFAULT_COMPANY = "华辰服饰有限公司"
TOKEN_PATTERN = re.compile(r"[\u3400-\u9fff]|[A-Za-z0-9_]+|[^\s]")


def approximate_token_count(text: str) -> int:
    """Offline token estimate: Chinese characters, words and punctuation are units."""
    return len(TOKEN_PATTERN.findall(text))


@dataclass(frozen=True, slots=True)
class KnowledgeBuildReport:
    source_directory: str
    documents_directory: str
    chroma_directory: str
    collection_name: str
    files: int
    pages: int
    chunks: int
    embedding_model: str
    built_at: str


class KnowledgeBuilder:
    """Build and maintain the local enterprise Chroma knowledge base."""

    def __init__(
        self,
        *,
        source_directory: str | Path,
        documents_directory: str | Path,
        chroma_directory: str | Path,
        collection_name: str,
        dashscope_api_key: str,
        embedding_model: str = "text-embedding-v3",
        chunk_size: int = 500,
        chunk_overlap: int = 100,
        company: str = DEFAULT_COMPANY,
        embeddings: Embeddings | None = None,
    ) -> None:
        if chunk_size <= 0:
            raise ValueError("knowledge chunk_size must be positive")
        if chunk_overlap < 0 or chunk_overlap >= chunk_size:
            raise ValueError("knowledge chunk_overlap must be >= 0 and smaller than chunk_size")
        self.source_directory = Path(source_directory).expanduser()
        self.documents_directory = Path(documents_directory).expanduser()
        self.chroma_directory = Path(chroma_directory).expanduser()
        self.collection_name = collection_name.strip()
        self.dashscope_api_key = dashscope_api_key.strip()
        self.embedding_model = embedding_model.strip()
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.company = company
        self._embeddings = embeddings
        self._vector_stores: list[Chroma] = []
        if not self.collection_name:
            raise ValueError("CHROMA_COLLECTION_NAME cannot be empty")

    @classmethod
    def from_settings(
        cls,
        settings: Settings,
        *,
        embeddings: Embeddings | None = None,
    ) -> "KnowledgeBuilder":
        return cls(
            source_directory=settings.knowledge_source_dir,
            documents_directory=settings.knowledge_docs_dir,
            chroma_directory=settings.chroma_db_path,
            collection_name=settings.chroma_collection_name,
            dashscope_api_key=settings.dashscope_api_key,
            embedding_model=settings.dashscope_embedding_model,
            chunk_size=settings.knowledge_chunk_size,
            chunk_overlap=settings.knowledge_chunk_overlap,
            embeddings=embeddings,
        )

    @property
    def embeddings(self) -> Embeddings:
        if self._embeddings is None:
            if not self.dashscope_api_key:
                raise ValueError(
                    "DASHSCOPE_API_KEY is required to build or query the enterprise knowledge base"
                )
            self._embeddings = DashScopeEmbeddings(
                model=self.embedding_model,
                dashscope_api_key=self.dashscope_api_key,
            )
        return self._embeddings

    def create_vector_store(self) -> Chroma:
        self.chroma_directory.mkdir(parents=True, exist_ok=True)
        vector_store = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=str(self.chroma_directory),
            collection_metadata={"hnsw:space": "cosine"},
        )
        self._vector_stores.append(vector_store)
        return vector_store

    def close(self) -> None:
        closed_clients: set[int] = set()
        for vector_store in self._vector_stores:
            client = getattr(vector_store, "_client", None)
            if client is not None and id(client) not in closed_clients and hasattr(client, "close"):
                client.close()
                closed_clients.add(id(client))
        self._vector_stores.clear()

    @staticmethod
    def _has_documents(vector_store: Chroma) -> bool:
        result = vector_store.get(limit=1, include=[])
        return bool(result.get("ids"))

    def ensure_vector_store(self, *, auto_build: bool = True) -> Chroma:
        vector_store = self.create_vector_store()
        if self._has_documents(vector_store):
            LOGGER.info(
                "Loaded Chroma knowledge base collection=%s directory=%s",
                self.collection_name,
                self.chroma_directory,
            )
            return vector_store
        if not auto_build:
            raise RuntimeError(
                f"Chroma collection '{self.collection_name}' is empty and KNOWLEDGE_AUTO_BUILD is disabled"
            )
        LOGGER.info("Chroma knowledge base is empty; starting offline knowledge build")
        self.build(rebuild=False, vector_store=vector_store)
        return vector_store

    @staticmethod
    def scan(directory: str | Path) -> list[Path]:
        root = Path(directory).expanduser()
        if not root.is_dir():
            raise FileNotFoundError(f"Knowledge directory does not exist: {root}")
        files = sorted(
            (
                path
                for path in root.rglob("*")
                if path.is_file() and path.suffix.lower() in SUPPORTED_SUFFIXES
            ),
            key=lambda path: str(path).casefold(),
        )
        if not files:
            raise FileNotFoundError(f"No Markdown or PDF files found in: {root}")
        return files

    def _sync_source_documents(self) -> list[Path]:
        self.documents_directory.mkdir(parents=True, exist_ok=True)
        source = self.source_directory.resolve()
        managed = self.documents_directory.resolve()
        if source == managed:
            return self.scan(self.documents_directory)

        source_files = self.scan(self.source_directory)
        for source_path in source_files:
            relative_path = source_path.relative_to(self.source_directory)
            destination = self.documents_directory / relative_path
            destination.parent.mkdir(parents=True, exist_ok=True)
            if (
                not destination.exists()
                or source_path.stat().st_size != destination.stat().st_size
                or source_path.read_bytes() != destination.read_bytes()
            ):
                shutil.copy2(source_path, destination)
                LOGGER.info("Synced knowledge document %s", destination)
        return self.scan(self.documents_directory)

    def prepared_document_paths(self) -> list[Path]:
        try:
            return self._sync_source_documents()
        except FileNotFoundError:
            if self.documents_directory.is_dir():
                LOGGER.warning(
                    "Knowledge source directory unavailable; using managed docs directory: %s",
                    self.documents_directory,
                )
                return self.scan(self.documents_directory)
            raise

    @staticmethod
    def _loader(path: Path) -> TextLoader | PyPDFLoader:
        suffix = path.suffix.lower()
        if suffix == ".md":
            return TextLoader(str(path), encoding="utf-8", autodetect_encoding=True)
        if suffix == ".pdf":
            return PyPDFLoader(str(path))
        raise ValueError(f"Unsupported knowledge file type: {path.suffix}")

    def _metadata(self, path: Path, original: dict[str, object]) -> dict[str, object]:
        stem = path.stem
        prefix = f"{self.company}_"
        category = stem[len(prefix) :] if stem.startswith(prefix) else stem
        category = category.replace("_", " ").strip() or "未分类"
        metadata: dict[str, object] = {
            "source": path.name,
            "category": category,
            "company": self.company,
            "file_type": path.suffix.lower().lstrip("."),
        }
        page = original.get("page")
        if isinstance(page, int):
            metadata["page"] = page
            metadata["page_number"] = page + 1
        return metadata

    def load_path(self, path: Path) -> list[Document]:
        try:
            loaded = self._loader(path).load()
        except Exception as exc:
            raise RuntimeError(f"Failed to load knowledge document {path.name}: {exc}") from exc
        documents = [
            Document(
                page_content=document.page_content.strip(),
                metadata=self._metadata(path, document.metadata),
            )
            for document in loaded
            if document.page_content.strip()
        ]
        if not documents:
            raise ValueError(f"Knowledge document has no extractable text: {path.name}")
        LOGGER.info("Loaded knowledge document %s pages=%d", path.name, len(documents))
        return documents

    def load_documents(self, paths: Iterable[Path] | None = None) -> list[Document]:
        documents: list[Document] = []
        for path in paths or self.prepared_document_paths():
            documents.extend(self.load_path(path))
        if not documents:
            raise ValueError("No extractable knowledge content was loaded")
        return documents

    def text_splitter(self) -> RecursiveCharacterTextSplitter:
        return RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=approximate_token_count,
            separators=["\n\n", "\n", "。", "！", "？", "；", "，", " ", ""],
        )

    def split_documents(self, documents: list[Document]) -> list[Document]:
        chunks = self.text_splitter().split_documents(documents)
        counters: dict[tuple[str, int], int] = defaultdict(int)
        for chunk in chunks:
            source = str(chunk.metadata["source"])
            page = int(chunk.metadata.get("page", -1))
            key = (source, page)
            chunk.metadata["chunk_index"] = counters[key]
            counters[key] += 1
        if not chunks:
            raise ValueError("Knowledge documents produced no chunks")
        return chunks

    @staticmethod
    def _chunk_id(document: Document) -> str:
        identity = "|".join(
            (
                str(document.metadata.get("source", "")),
                str(document.metadata.get("page", "")),
                str(document.metadata.get("chunk_index", "")),
                document.page_content,
            )
        )
        return hashlib.sha256(identity.encode("utf-8")).hexdigest()

    @staticmethod
    def _batches(items: list[Document], size: int = 64) -> Iterable[list[Document]]:
        for start in range(0, len(items), size):
            yield items[start : start + size]

    def index_documents(
        self,
        vector_store: Chroma,
        documents: list[Document],
        *,
        replace_sources: bool = True,
    ) -> int:
        chunks = self.split_documents(documents)
        new_ids = {self._chunk_id(document) for document in chunks}
        previous_ids: set[str] = set()
        if replace_sources:
            for source in {str(chunk.metadata["source"]) for chunk in chunks}:
                existing = vector_store.get(where={"source": source}, include=[])
                previous_ids.update(existing.get("ids") or [])
        for batch in self._batches(chunks):
            vector_store.add_documents(
                documents=batch,
                ids=[self._chunk_id(document) for document in batch],
            )
        obsolete_ids = previous_ids - new_ids
        if obsolete_ids:
            vector_store.delete(ids=sorted(obsolete_ids))
        return len(chunks)

    def save_uploaded_file(self, filename: str, data: bytes) -> Path:
        safe_name = Path(filename).name
        if not safe_name or Path(safe_name).suffix.lower() not in SUPPORTED_SUFFIXES:
            raise ValueError("仅支持 .md 和 .pdf 企业知识文件")
        self.documents_directory.mkdir(parents=True, exist_ok=True)
        destination = self.documents_directory / safe_name
        destination.write_bytes(data)
        LOGGER.info("Saved uploaded knowledge document %s", destination)
        return destination

    def build(
        self,
        *,
        rebuild: bool = False,
        vector_store: Chroma | None = None,
    ) -> KnowledgeBuildReport:
        paths = self.prepared_document_paths()
        documents = self.load_documents(paths)
        store = vector_store or self.create_vector_store()
        if rebuild and self._has_documents(store):
            LOGGER.warning("Resetting Chroma collection %s", self.collection_name)
            store.delete_collection()
            store = self.create_vector_store()
        chunk_count = self.index_documents(store, documents, replace_sources=True)
        report = KnowledgeBuildReport(
            source_directory=str(self.source_directory),
            documents_directory=str(self.documents_directory),
            chroma_directory=str(self.chroma_directory),
            collection_name=self.collection_name,
            files=len(paths),
            pages=len(documents),
            chunks=chunk_count,
            embedding_model=self.embedding_model,
            built_at=datetime.now(timezone.utc).isoformat(),
        )
        self.chroma_directory.mkdir(parents=True, exist_ok=True)
        (self.chroma_directory / "knowledge_manifest.json").write_text(
            json.dumps(asdict(report), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        LOGGER.info(
            "Knowledge build completed files=%d pages=%d chunks=%d",
            report.files,
            report.pages,
            report.chunks,
        )
        return report


def main() -> None:
    parser = argparse.ArgumentParser(description="Build the offline enterprise Chroma knowledge base")
    parser.add_argument("--source-dir", help="directory containing Markdown/PDF source files")
    parser.add_argument("--rebuild", action="store_true", help="replace the existing Chroma collection")
    parser.add_argument("--log-level", default="INFO", choices=("DEBUG", "INFO", "WARNING", "ERROR"))
    args = parser.parse_args()
    logging.basicConfig(
        level=getattr(logging, args.log_level),
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )
    settings = Settings.from_env()
    if args.source_dir:
        settings = replace(settings, knowledge_source_dir=args.source_dir)
    report = KnowledgeBuilder.from_settings(settings).build(rebuild=args.rebuild)
    print(json.dumps(asdict(report), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
