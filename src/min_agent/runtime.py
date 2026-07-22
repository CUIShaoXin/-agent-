from __future__ import annotations

import uuid
from typing import Any

from .llm import LLM
from .models import ToolContext
from .storage import SQLiteStore
from .tools import ToolRegistry, encode_tool_output


class AgentRuntime:
    def __init__(self, llm: LLM, tools: ToolRegistry, store: SQLiteStore, max_steps: int = 6, context_messages: int = 12) -> None:
        if max_steps < 1:
            raise ValueError("max_steps must be >= 1")
        self.llm = llm
        self.tools = tools
        self.store = store
        self.max_steps = max_steps
        self.context_messages = max(4, context_messages)

    def run(self, user_id: str, session_id: str, user_input: str) -> str:
        if not user_input.strip():
            raise ValueError("user_input cannot be empty")
        run_id = uuid.uuid4().hex
        self.store.add_message(user_id, session_id, "user", user_input.strip())
        compacted = self.store.compact(user_id, session_id, self.context_messages)
        context = self.store.get_context(user_id, session_id, self.context_messages)
        continuation: list[dict[str, Any]] = []
        self.store.trace(run_id, user_id, session_id, 0, "run_start", {"input": user_input, "compacted": compacted})

        for step in range(1, self.max_steps + 1):
            self.store.trace(run_id, user_id, session_id, step, "llm_request", {
                "context_items": len(context), "continuation_items": len(continuation),
            })
            try:
                turn = self.llm.complete(context, continuation, self.tools.schemas())
            except Exception as exc:
                message = f"LLM 调用失败：{type(exc).__name__}: {exc}"
                self.store.trace(run_id, user_id, session_id, step, "llm_error", {"error": message})
                self.store.add_message(user_id, session_id, "assistant", message)
                return message

            self.store.trace(run_id, user_id, session_id, step, "llm_response", {
                "decision_summary": turn.decision_summary,
                "tool_calls": [{"name": call.name, "arguments": call.arguments} for call in turn.tool_calls],
                "has_final_answer": bool(turn.final_answer),
            })
            if turn.tool_calls:
                continuation.extend(turn.response_items or [
                    {"type": "function_call", "call_id": call.call_id, "name": call.name, "arguments": encode_tool_output(call.arguments)}
                    for call in turn.tool_calls
                ])
                for call in turn.tool_calls:
                    result = self.tools.execute(call.name, call.arguments, ToolContext(user_id, session_id, self.store))
                    output = encode_tool_output(result)
                    continuation.append({"type": "function_call_output", "call_id": call.call_id, "output": output})
                    self.store.add_message(user_id, session_id, "tool", output, call.name)
                    self.store.trace(run_id, user_id, session_id, step, "tool_result", {
                        "call_id": call.call_id, "name": call.name, "arguments": call.arguments, "output": result,
                    })
                continue

            if turn.final_answer:
                self.store.add_message(user_id, session_id, "assistant", turn.final_answer)
                self.store.trace(run_id, user_id, session_id, step, "run_end", {"answer": turn.final_answer})
                return turn.final_answer

            continuation.extend(turn.response_items)
            continuation.append({"role": "user", "content": "Return a final answer or call a tool."})

        message = f"已达到最大执行步数（{self.max_steps}），为避免无限循环已停止。"
        self.store.add_message(user_id, session_id, "assistant", message)
        self.store.trace(run_id, user_id, session_id, self.max_steps, "max_steps_reached", {"answer": message})
        return message

