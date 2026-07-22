from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class ToolCall:
    call_id: str
    name: str
    arguments: dict[str, Any]


@dataclass(slots=True)
class ModelTurn:
    """Normalized result produced by an LLM adapter."""

    final_answer: str | None = None
    tool_calls: list[ToolCall] = field(default_factory=list)
    decision_summary: str = ""
    response_items: list[dict[str, Any]] = field(default_factory=list)


@dataclass(slots=True)
class ToolContext:
    user_id: str
    session_id: str
    store: Any

