from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _csv(name: str, default: str = "") -> tuple[str, ...]:
    return tuple(item.strip() for item in os.getenv(name, default).split(",") if item.strip())


def _boolean(name: str, default: bool = False) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "on"}


def _default_knowledge_source_dir() -> str:
    desktop_directory = Path.home() / "Desktop" / "clothing_company_knowledge_base"
    return str(desktop_directory if desktop_directory.is_dir() else Path("knowledge_base/docs"))


@dataclass(frozen=True, slots=True)
class Settings:
    openai_api_key: str
    openai_model: str
    embedding_model: str
    dashscope_api_key: str
    dashscope_embedding_model: str
    agent_db_path: str
    knowledge_db_path: str
    knowledge_source_dir: str
    knowledge_docs_dir: str
    chroma_db_path: str
    chroma_collection_name: str
    knowledge_chunk_size: int
    knowledge_chunk_overlap: int
    knowledge_auto_build: bool
    context_messages: int
    rag_top_k: int
    mysql_host: str
    mysql_port: int
    mysql_user: str
    mysql_password: str
    mysql_database: str
    mysql_allowed_tables: tuple[str, ...]
    mysql_max_rows: int
    cors_origins: tuple[str, ...]
    max_upload_bytes: int

    @classmethod
    def from_env(cls) -> "Settings":
        return cls(
            openai_api_key=os.getenv("OPENAI_API_KEY", ""),
            openai_model=os.getenv("OPENAI_MODEL", "gpt-5.6-terra"),
            embedding_model=os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
            dashscope_api_key=os.getenv("DASHSCOPE_API_KEY", ""),
            dashscope_embedding_model=os.getenv("DASHSCOPE_EMBEDDING_MODEL", "text-embedding-v3"),
            agent_db_path=os.getenv("AGENT_DB_PATH", "data/agent.db"),
            knowledge_db_path=os.getenv("KNOWLEDGE_DB_PATH", "data/knowledge.db"),
            knowledge_source_dir=os.getenv("KNOWLEDGE_SOURCE_DIR", _default_knowledge_source_dir()),
            knowledge_docs_dir=os.getenv("KNOWLEDGE_DOCS_DIR", "knowledge_base/docs"),
            chroma_db_path=os.getenv("CHROMA_DB_PATH", "knowledge_base/chroma_db"),
            chroma_collection_name=os.getenv("CHROMA_COLLECTION_NAME", "huachen_enterprise"),
            knowledge_chunk_size=max(100, int(os.getenv("KNOWLEDGE_CHUNK_SIZE", "500"))),
            knowledge_chunk_overlap=max(0, int(os.getenv("KNOWLEDGE_CHUNK_OVERLAP", "100"))),
            knowledge_auto_build=_boolean("KNOWLEDGE_AUTO_BUILD", True),
            context_messages=max(4, int(os.getenv("AGENT_CONTEXT_MESSAGES", "12"))),
            rag_top_k=max(1, min(10, int(os.getenv("RAG_TOP_K", "5")))),
            mysql_host=os.getenv("MYSQL_HOST", ""),
            mysql_port=int(os.getenv("MYSQL_PORT", "3306")),
            mysql_user=os.getenv("MYSQL_USER", ""),
            mysql_password=os.getenv("MYSQL_PASSWORD", ""),
            mysql_database=os.getenv("MYSQL_DATABASE", ""),
            mysql_allowed_tables=_csv("MYSQL_ALLOWED_TABLES"),
            mysql_max_rows=max(1, min(500, int(os.getenv("MYSQL_MAX_ROWS", "100")))),
            cors_origins=_csv(
                "CORS_ORIGINS",
                "http://localhost:3000,http://localhost:3001,https://cuishaoxin.github.io",
            ),
            max_upload_bytes=max(1024, int(os.getenv("KNOWLEDGE_MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))),
        )

    @property
    def mysql_configured(self) -> bool:
        return all((self.mysql_host, self.mysql_user, self.mysql_database))

    @property
    def knowledge_configured(self) -> bool:
        return bool(self.dashscope_api_key)
