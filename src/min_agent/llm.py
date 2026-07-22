from __future__ import annotations

import json
import os
import re
import time
import urllib.error
import urllib.request
from typing import Any, Protocol

from .models import ModelTurn, ToolCall


SYSTEM_PROMPT = """You are a useful minimal Agent.
Decide whether to answer directly or call one or more provided tools.
Use tools when they are necessary; after observations, either call another tool or answer.
Never invent tool results. Mock weather/search results must be labeled as mock data.
Keep final answers concise. Do not reveal hidden chain-of-thought.
"""


class LLM(Protocol):
    def complete(
        self,
        context: list[dict[str, Any]],
        continuation_items: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> ModelTurn: ...


class ResponseParser:
    """Converts the provider response into final answer, tool calls and safe reasoning summary."""

    @staticmethod
    def parse(data: dict[str, Any]) -> ModelTurn:
        calls: list[ToolCall] = []
        texts: list[str] = []
        summaries: list[str] = []
        output = data.get("output") or []
        for item in output:
            item_type = item.get("type")
            if item_type == "function_call":
                raw_args = item.get("arguments", "{}")
                try:
                    args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
                    if not isinstance(args, dict):
                        raise ValueError("arguments must be a JSON object")
                except (json.JSONDecodeError, ValueError) as exc:
                    args = {"__parse_error__": f"invalid tool arguments: {exc}"}
                calls.append(ToolCall(item.get("call_id") or item.get("id", "missing-call-id"), item.get("name", ""), args))
            elif item_type == "message":
                for content in item.get("content") or []:
                    if content.get("type") in {"output_text", "text"} and content.get("text"):
                        texts.append(content["text"])
            elif item_type == "reasoning":
                for summary in item.get("summary") or []:
                    if isinstance(summary, dict) and summary.get("text"):
                        summaries.append(summary["text"])
        answer = "\n".join(texts).strip() or data.get("output_text") or None
        if answer:
            match = re.search(r"<decision>(.*?)</decision>", answer, flags=re.I | re.S)
            if match:
                summaries.append(match.group(1).strip())
                answer = re.sub(r"<decision>.*?</decision>", "", answer, flags=re.I | re.S).strip()
        return ModelTurn(answer, calls, "\n".join(summaries), output)


class OpenAIResponsesLLM:
    """Small REST adapter; the Agent Runtime itself remains provider/framework independent."""

    def __init__(self, api_key: str | None = None, model: str | None = None, timeout: int = 60, retries: int = 2) -> None:
        self.api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.model = model or os.getenv("OPENAI_MODEL", "gpt-5.6-terra")
        self.timeout = timeout
        self.retries = retries
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY is not set")

    def complete(self, context: list[dict[str, Any]], continuation_items: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ModelTurn:
        payload = {
            "model": self.model,
            "instructions": SYSTEM_PROMPT,
            "input": [*context, *continuation_items],
            "tools": tools,
            "tool_choice": "auto",
            "reasoning": {"effort": "low", "summary": "auto"},
            "store": False,
        }
        request = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
            method="POST",
        )
        for attempt in range(self.retries + 1):
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    return ResponseParser.parse(json.loads(response.read().decode("utf-8")))
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")
                if exc.code not in {429, 500, 502, 503, 504} or attempt == self.retries:
                    # Provider errors can echo a masked credential; never persist it in trace/session memory.
                    safe_detail = re.sub(r"sk-[^\s\"']+", "[REDACTED_API_KEY]", detail[:500])
                    raise RuntimeError(f"OpenAI API HTTP {exc.code}: {safe_detail}") from exc
            except urllib.error.URLError as exc:
                if attempt == self.retries:
                    raise RuntimeError(f"OpenAI API network error: {exc.reason}") from exc
            time.sleep(2**attempt)
        raise RuntimeError("OpenAI API retry loop ended unexpectedly")


class ScriptedLLM:
    """Deterministic test double. It is not used by the real CLI path."""

    def __init__(self, turns: list[ModelTurn]) -> None:
        self.turns = list(turns)
        self.requests: list[dict[str, Any]] = []

    def complete(self, context: list[dict[str, Any]], continuation_items: list[dict[str, Any]], tools: list[dict[str, Any]]) -> ModelTurn:
        self.requests.append({"context": context, "continuation_items": list(continuation_items), "tools": tools})
        if not self.turns:
            raise RuntimeError("no scripted LLM turn left")
        return self.turns.pop(0)
