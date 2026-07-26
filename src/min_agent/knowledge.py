from __future__ import annotations

import io
import json
import math
import sqlite3
import threading
import uuid
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Protocol


class Embedder(Protocol):
    def embed(self, texts: list[str]) -> list[list[float]]: ...


@dataclass(frozen=True, slots=True)
class KnowledgeHit:
    document_id: str
    filename: str
    content: str
    score: float


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _chunk_text(text: str, size: int = 900, overlap: int = 120) -> list[str]:
    normalized = "\n".join(line.strip() for line in text.splitlines() if line.strip())
    if not normalized:
        return []
    chunks: list[str] = []
    start = 0
    while start < len(normalized):
        end = min(len(normalized), start + size)
        if end < len(normalized):
            boundary = max(normalized.rfind("\n", start, end), normalized.rfind("。", start, end))
            if boundary > start + size // 2:
                end = boundary + 1
        chunks.append(normalized[start:end].strip())
        if end >= len(normalized):
            break
        start = max(start + 1, end - overlap)
    return [chunk for chunk in chunks if chunk]


def extract_document_text(filename: str, data: bytes) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix in {".txt", ".md", ".csv"}:
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
    raise ValueError("仅支持 .txt、.md、.csv 和 .pdf 文件")


class SQLiteKnowledgeBase:
    def __init__(self, path: str) -> None:
        self.path = path
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._db = sqlite3.connect(path, check_same_thread=False)
        self._db.row_factory = sqlite3.Row
        self._lock = threading.RLock()
        with self._db:
            self._db.executescript("""
                CREATE TABLE IF NOT EXISTS knowledge_documents (
                    id TEXT PRIMARY KEY, filename TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS knowledge_chunks (
                    id TEXT PRIMARY KEY, document_id TEXT NOT NULL,
                    chunk_index INTEGER NOT NULL, content TEXT NOT NULL,
                    embedding TEXT NOT NULL,
                    FOREIGN KEY(document_id) REFERENCES knowledge_documents(id)
                );
                CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document
                    ON knowledge_chunks(document_id, chunk_index);
            """)

    def ingest(self, filename: str, text: str, embedder: Embedder) -> dict[str, int | str]:
        chunks = _chunk_text(text)
        if not chunks:
            raise ValueError("文档没有可索引的文字内容")
        embeddings = embedder.embed(chunks)
        document_id = uuid.uuid4().hex
        with self._lock, self._db:
            self._db.execute(
                "INSERT INTO knowledge_documents(id,filename,created_at) VALUES(?,?,?)",
                (document_id, filename, _now()),
            )
            self._db.executemany(
                "INSERT INTO knowledge_chunks(id,document_id,chunk_index,content,embedding) VALUES(?,?,?,?,?)",
                [
                    (uuid.uuid4().hex, document_id, index, chunk, json.dumps(vector))
                    for index, (chunk, vector) in enumerate(zip(chunks, embeddings, strict=True))
                ],
            )
        return {"document_id": document_id, "filename": filename, "chunks": len(chunks)}

    @staticmethod
    def _cosine(left: list[float], right: list[float]) -> float:
        if len(left) != len(right) or not left:
            return 0.0
        dot = sum(a * b for a, b in zip(left, right, strict=True))
        left_norm = math.sqrt(sum(value * value for value in left))
        right_norm = math.sqrt(sum(value * value for value in right))
        if not left_norm or not right_norm:
            return 0.0
        return dot / (left_norm * right_norm)

    def search(self, query: str, embedder: Embedder, limit: int = 5) -> list[KnowledgeHit]:
        with self._lock:
            rows = self._db.execute("""
                SELECT c.document_id, d.filename, c.content, c.embedding
                FROM knowledge_chunks c
                JOIN knowledge_documents d ON d.id = c.document_id
            """).fetchall()
        if not rows:
            return []
        query_vector = embedder.embed([query])[0]
        ranked = sorted(
            (
                KnowledgeHit(
                    document_id=row["document_id"],
                    filename=row["filename"],
                    content=row["content"],
                    score=self._cosine(query_vector, json.loads(row["embedding"])),
                )
                for row in rows
            ),
            key=lambda item: item.score,
            reverse=True,
        )
        return ranked[:limit]

    def document_count(self) -> int:
        with self._lock:
            return int(self._db.execute("SELECT COUNT(*) FROM knowledge_documents").fetchone()[0])

    def close(self) -> None:
        self._db.close()
