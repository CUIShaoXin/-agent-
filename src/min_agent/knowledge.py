from __future__ import annotations

import hashlib
import io
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

from langchain_chroma import Chroma

from .config import Settings
from .knowledge_builder import KnowledgeBuilder


@dataclass(frozen=True, slots=True)
class KnowledgeHit:
    document_id: str
    filename: str
    content: str
    score: float
    metadata: dict[str, Any] = field(default_factory=dict)


def extract_document_text(filename: str, data: bytes) -> str:
    """Backward-compatible text extraction helper for callers outside the builder."""
    suffix = Path(filename).suffix.lower()
    if suffix == ".md":
        for encoding in ("utf-8-sig", "utf-8", "gb18030"):
            try:
                return data.decode(encoding)
            except UnicodeDecodeError:
                continue
        raise ValueError("文件编码无法识别，请使用 UTF-8")
    if suffix == ".pdf":
        try:
            from pypdf import PdfReader
        except ImportError as exc:
            raise RuntimeError("PDF support requires pypdf") from exc
        reader = PdfReader(io.BytesIO(data))
        return "\n".join((page.extract_text() or "") for page in reader.pages)
    raise ValueError("仅支持 .md 和 .pdf 文件")


class ChromaKnowledgeBase:
    """Chroma-backed enterprise knowledge store and LangChain retriever."""

    def __init__(
        self,
        builder: KnowledgeBuilder,
        vector_store: Chroma,
        *,
        top_k: int = 5,
    ) -> None:
        self.builder = builder
        self.vector_store = vector_store
        self.top_k = top_k
        self.retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": top_k},
        )

    @classmethod
    def from_settings(cls, settings: Settings) -> "ChromaKnowledgeBase":
        builder = KnowledgeBuilder.from_settings(settings)
        vector_store = builder.ensure_vector_store(auto_build=settings.knowledge_auto_build)
        return cls(builder, vector_store, top_k=settings.rag_top_k)

    @staticmethod
    def _document_id(filename: str, content: str, metadata: dict[str, Any]) -> str:
        identity = "|".join(
            (
                filename,
                str(metadata.get("page", "")),
                str(metadata.get("chunk_index", "")),
                content,
            )
        )
        return hashlib.sha256(identity.encode("utf-8")).hexdigest()

    def search(self, query: str, limit: int | None = None) -> list[KnowledgeHit]:
        resolved_limit = limit or self.top_k
        matches = self.vector_store.similarity_search_with_score(query, k=resolved_limit)
        hits: list[KnowledgeHit] = []
        for document, distance in matches:
            metadata = dict(document.metadata)
            filename = str(metadata.get("source", "unknown"))
            hits.append(
                KnowledgeHit(
                    document_id=self._document_id(filename, document.page_content, metadata),
                    filename=filename,
                    content=document.page_content,
                    score=1.0 / (1.0 + max(0.0, float(distance))),
                    metadata=metadata,
                )
            )
        return hits

    def ingest(self, filename: str, data: bytes) -> dict[str, int | str]:
        safe_name = Path(filename).name
        destination = self.builder.documents_directory / safe_name
        previous_data = destination.read_bytes() if destination.is_file() else None
        path = self.builder.save_uploaded_file(safe_name, data)
        try:
            documents = self.builder.load_documents([path])
            chunks = self.builder.index_documents(
                self.vector_store,
                documents,
                replace_sources=True,
            )
        except Exception:
            if previous_data is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(previous_data)
            raise
        return {
            "document_id": hashlib.sha256(path.name.encode("utf-8")).hexdigest(),
            "filename": path.name,
            "chunks": chunks,
        }

    def _all_metadatas(self) -> list[dict[str, Any]]:
        payload = self.vector_store.get(include=["metadatas"])
        return [dict(item) for item in payload.get("metadatas") or [] if item]

    def document_count(self) -> int:
        return len({str(item.get("source")) for item in self._all_metadatas() if item.get("source")})

    def chunk_count(self) -> int:
        return len(self.vector_store.get(include=[]).get("ids") or [])

    def close(self) -> None:
        self.builder.close()
