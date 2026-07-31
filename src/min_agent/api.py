from __future__ import annotations

import logging
import threading
import uuid
from contextlib import asynccontextmanager
from dataclasses import asdict
from typing import Any

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field

from .config import Settings
from .customer_agent import CustomerServiceAgent

LOGGER = logging.getLogger(__name__)


class ChatRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(min_length=1, max_length=8000)
    session_id: str | None = Field(default=None, min_length=1, max_length=128)


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    answer: str
    session_id: str
    intent: str
    sources: list[dict[str, Any]]
    database_used: bool


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or Settings.from_env()
    required_cors_origins = {
        "http://localhost:3000",
        "https://cuishaoxin.github.io",
    }

    @asynccontextmanager
    async def lifespan(application: FastAPI):
        if application.state.customer_agent is None:
            if resolved.dashscope_api_key:
                LOGGER.info("Initializing DashScope customer Agent")
                application.state.customer_agent = CustomerServiceAgent.from_settings(resolved)
                LOGGER.info(
                    "Knowledge Base Ready: directory=%s collection=%s",
                    resolved.chroma_db_path,
                    resolved.chroma_collection_name,
                )
            else:
                LOGGER.warning("Customer Agent startup deferred: DASHSCOPE_API_KEY is not configured")
        try:
            yield
        finally:
            agent = application.state.customer_agent
            if agent is not None and hasattr(agent, "close"):
                agent.close()

    app = FastAPI(title="Minimum Agent Customer Service API", version="1.0.0", lifespan=lifespan)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=sorted(set(resolved.cors_origins) | required_cors_origins),
        allow_credentials=False,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type"],
        allow_private_network=True,
    )
    app.state.settings = resolved
    app.state.customer_agent = None
    app.state.agent_lock = threading.Lock()

    def get_agent() -> CustomerServiceAgent:
        if app.state.customer_agent is not None:
            return app.state.customer_agent
        with app.state.agent_lock:
            if app.state.customer_agent is None:
                try:
                    app.state.customer_agent = CustomerServiceAgent.from_settings(resolved)
                except (FileNotFoundError, RuntimeError, ValueError) as exc:
                    raise HTTPException(status_code=503, detail=str(exc)) from exc
        return app.state.customer_agent

    @app.get("/health")
    def health() -> dict[str, Any]:
        if not resolved.dashscope_api_key:
            return {
                "status": "offline",
                "service": "clothing-company-agent",
                "knowledge_base": "unavailable",
                "llm_configured": False,
                "embedding_configured": bool(resolved.dashscope_api_key),
                "mysql_configured": resolved.mysql_configured,
                "knowledge_documents": 0,
            }
        details = get_agent().health()
        return {
            "status": "online",
            "service": "clothing-company-agent",
            "knowledge_base": "ready",
            **details,
        }

    @app.post("/chat", response_model=ChatResponse)
    def chat(payload: ChatRequest) -> ChatResponse:
        try:
            session_id = payload.session_id or f"api-{uuid.uuid4().hex}"
            result = get_agent().chat(payload.message, session_id)
            return ChatResponse(**asdict(result))
        except HTTPException:
            raise
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Agent execution failed: {type(exc).__name__}") from exc

    @app.post("/knowledge/upload")
    def upload_knowledge(file: UploadFile = File(...)) -> dict[str, Any]:
        filename = file.filename or "document.txt"
        data = file.file.read(resolved.max_upload_bytes + 1)
        if len(data) > resolved.max_upload_bytes:
            raise HTTPException(status_code=413, detail="Knowledge file is too large")
        try:
            return {"ok": True, **get_agent().upload_knowledge(filename, data)}
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Knowledge ingestion failed: {type(exc).__name__}") from exc

    return app


app = create_app()
