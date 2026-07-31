from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

from dashscope import Generation

LOGGER = logging.getLogger(__name__)


class DashScopeService:
    """Small Qwen adapter used by the customer-service RAG pipeline."""

    def __init__(
        self,
        api_key: str,
        model: str = "qwen-plus",
        *,
        timeout: int = 60,
        retries: int = 2,
    ) -> None:
        if not api_key:
            raise ValueError("DASHSCOPE_API_KEY is not set")
        self.api_key = api_key
        self.model = model
        self.timeout = timeout
        self.retries = retries

    @staticmethod
    def _normalize_messages(
        instructions: str,
        input_items: list[dict[str, Any]],
    ) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = [{"role": "system", "content": instructions}]
        for item in input_items:
            role = str(item.get("role", "user"))
            if role == "developer":
                role = "system"
            if role not in {"system", "user", "assistant"}:
                role = "user"
            content = item.get("content", "")
            if not isinstance(content, str):
                content = json.dumps(content, ensure_ascii=False, default=str)
            messages.append({"role": role, "content": content})
        return messages

    @staticmethod
    def _response_value(response: Any, key: str, default: Any = None) -> Any:
        value = getattr(response, key, None)
        if value is not None:
            return value
        if isinstance(response, dict):
            return response.get(key, default)
        return default

    @classmethod
    def _output_text(cls, response: Any) -> str:
        output = cls._response_value(response, "output", {})
        choices = getattr(output, "choices", None)
        if choices is None and isinstance(output, dict):
            choices = output.get("choices")
        if not choices:
            return ""
        choice = choices[0]
        message = getattr(choice, "message", None)
        if message is None and isinstance(choice, dict):
            message = choice.get("message")
        content = getattr(message, "content", None)
        if content is None and isinstance(message, dict):
            content = message.get("content")
        if isinstance(content, list):
            parts = [
                str(item.get("text", ""))
                for item in content
                if isinstance(item, dict) and item.get("text")
            ]
            return "\n".join(parts).strip()
        return str(content or "").strip()

    def _call(
        self,
        messages: list[dict[str, str]],
        *,
        response_format: dict[str, str] | None = None,
    ) -> str:
        for attempt in range(self.retries + 1):
            try:
                kwargs: dict[str, Any] = {
                    "api_key": self.api_key,
                    "model": self.model,
                    "messages": messages,
                    "result_format": "message",
                    "temperature": 0.1,
                    "timeout": self.timeout,
                }
                if response_format is not None:
                    kwargs["response_format"] = response_format
                response = Generation.call(**kwargs)
                status_code = int(self._response_value(response, "status_code", 500))
                if status_code == 200:
                    text = self._output_text(response)
                    if not text:
                        raise RuntimeError("DashScope response did not contain output text")
                    return text

                code = str(self._response_value(response, "code", "unknown"))
                message = str(self._response_value(response, "message", "unknown error"))
                safe_message = re.sub(r"sk-[A-Za-z0-9_-]+", "[REDACTED_API_KEY]", message)
                if status_code not in {429, 500, 502, 503, 504} or attempt == self.retries:
                    raise RuntimeError(
                        f"DashScope API HTTP {status_code} ({code}): {safe_message[:600]}"
                    )
                LOGGER.warning(
                    "DashScope request failed status=%s code=%s retry=%s/%s",
                    status_code,
                    code,
                    attempt + 1,
                    self.retries,
                )
            except RuntimeError:
                raise
            except Exception as exc:
                if attempt == self.retries:
                    raise RuntimeError(
                        f"DashScope API request failed: {type(exc).__name__}: {exc}"
                    ) from exc
                LOGGER.warning(
                    "DashScope request raised %s retry=%s/%s",
                    type(exc).__name__,
                    attempt + 1,
                    self.retries,
                )
            time.sleep(2**attempt)
        raise RuntimeError("DashScope API retry loop ended unexpectedly")

    def respond(
        self,
        instructions: str,
        input_items: list[dict[str, Any]],
        *,
        reasoning_effort: str = "low",
        safety_identifier: str | None = None,
    ) -> str:
        del reasoning_effort, safety_identifier
        return self._call(self._normalize_messages(instructions, input_items))

    def structured(
        self,
        instructions: str,
        input_text: str,
        *,
        name: str,
        schema: dict[str, Any],
        safety_identifier: str | None = None,
    ) -> dict[str, Any]:
        del safety_identifier
        schema_text = json.dumps(schema, ensure_ascii=False)
        messages = self._normalize_messages(
            (
                f"{instructions}\n"
                f"请只输出一个合法 JSON 对象，不要输出 Markdown。"
                f"对象必须符合名为 {name} 的 JSON Schema：{schema_text}"
            ),
            [{"role": "user", "content": input_text}],
        )
        text = self._call(messages, response_format={"type": "json_object"})
        try:
            parsed = json.loads(text)
        except json.JSONDecodeError as exc:
            raise RuntimeError("DashScope structured response was not valid JSON") from exc
        if not isinstance(parsed, dict):
            raise RuntimeError("DashScope structured response must be a JSON object")
        return parsed
