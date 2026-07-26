from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from typing import Any


class OpenAIService:
    """Small OpenAI Responses/Embeddings API client without an Agent framework."""

    def __init__(self, api_key: str, model: str, embedding_model: str, timeout: int = 60, retries: int = 2) -> None:
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set")
        self.api_key = api_key
        self.model = model
        self.embedding_model = embedding_model
        self.timeout = timeout
        self.retries = retries

    def _post(self, path: str, payload: dict[str, Any]) -> dict[str, Any]:
        request = urllib.request.Request(
            f"https://api.openai.com/v1/{path}",
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        for attempt in range(self.retries + 1):
            try:
                with urllib.request.urlopen(request, timeout=self.timeout) as response:
                    return json.loads(response.read().decode("utf-8"))
            except urllib.error.HTTPError as exc:
                detail = exc.read().decode("utf-8", errors="replace")[:600]
                if exc.code not in {429, 500, 502, 503, 504} or attempt == self.retries:
                    safe_detail = re.sub(r"sk-[^\s\"']+", "[REDACTED_API_KEY]", detail)
                    raise RuntimeError(f"OpenAI API HTTP {exc.code}: {safe_detail}") from exc
            except urllib.error.URLError as exc:
                if attempt == self.retries:
                    raise RuntimeError(f"OpenAI API network error: {exc.reason}") from exc
            time.sleep(2**attempt)
        raise RuntimeError("OpenAI API retry loop ended unexpectedly")

    @staticmethod
    def _output_text(data: dict[str, Any]) -> str:
        if data.get("output_text"):
            return str(data["output_text"]).strip()
        texts: list[str] = []
        for item in data.get("output") or []:
            if item.get("type") != "message":
                continue
            for content in item.get("content") or []:
                if content.get("type") in {"output_text", "text"} and content.get("text"):
                    texts.append(str(content["text"]))
        return "\n".join(texts).strip()

    def respond(
        self,
        instructions: str,
        input_items: list[dict[str, Any]],
        *,
        reasoning_effort: str = "low",
        safety_identifier: str | None = None,
    ) -> str:
        payload: dict[str, Any] = {
            "model": self.model,
            "instructions": instructions,
            "input": input_items,
            "reasoning": {"effort": reasoning_effort},
            "text": {"verbosity": "medium"},
            "store": False,
        }
        if safety_identifier:
            payload["safety_identifier"] = safety_identifier
        data = self._post("responses", payload)
        text = self._output_text(data)
        if not text:
            raise RuntimeError("OpenAI response did not contain output text")
        return text

    def structured(
        self,
        instructions: str,
        input_text: str,
        *,
        name: str,
        schema: dict[str, Any],
        safety_identifier: str | None = None,
    ) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "model": self.model,
            "instructions": instructions,
            "input": [{"role": "user", "content": input_text}],
            "reasoning": {"effort": "low"},
            "text": {
                "format": {
                    "type": "json_schema",
                    "name": name,
                    "strict": True,
                    "schema": schema,
                }
            },
            "store": False,
        }
        if safety_identifier:
            payload["safety_identifier"] = safety_identifier
        data = self._post("responses", payload)
        text = self._output_text(data)
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            raise RuntimeError("OpenAI structured response was not valid JSON") from exc
        if not isinstance(parsed, dict):
            raise RuntimeError("OpenAI structured response must be a JSON object")
        return parsed

    def embed(self, texts: list[str]) -> list[list[float]]:
        if not texts:
            return []
        data = self._post("embeddings", {"model": self.embedding_model, "input": texts})
        rows = sorted(data.get("data") or [], key=lambda item: item.get("index", 0))
        embeddings = [row.get("embedding") for row in rows]
        if len(embeddings) != len(texts) or not all(isinstance(item, list) for item in embeddings):
            raise RuntimeError("OpenAI embeddings response was incomplete")
        return embeddings
