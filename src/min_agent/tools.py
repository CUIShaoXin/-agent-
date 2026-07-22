from __future__ import annotations

import ast
import json
import operator
from dataclasses import dataclass
from typing import Any, Callable

from .models import ToolContext


ToolHandler = Callable[[dict[str, Any], ToolContext], Any]


@dataclass(frozen=True, slots=True)
class Tool:
    name: str
    description: str
    parameters: dict[str, Any]
    handler: ToolHandler

    def schema(self) -> dict[str, Any]:
        return {
            "type": "function",
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
            "strict": True,
        }


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        if tool.name in self._tools:
            raise ValueError(f"tool already registered: {tool.name}")
        self._tools[tool.name] = tool

    def schemas(self) -> list[dict[str, Any]]:
        return [tool.schema() for tool in self._tools.values()]

    def execute(self, name: str, arguments: dict[str, Any], context: ToolContext) -> dict[str, Any]:
        tool = self._tools.get(name)
        if tool is None:
            return {"ok": False, "error": f"unknown tool: {name}"}
        if "__parse_error__" in arguments:
            return {"ok": False, "error": arguments["__parse_error__"]}
        try:
            result = tool.handler(arguments, context)
            return {"ok": True, "result": result}
        except Exception as exc:  # Tool errors are observations, not runtime crashes.
            return {"ok": False, "error": f"{type(exc).__name__}: {exc}"}


_BINARY_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.FloorDiv: operator.floordiv,
    ast.Mod: operator.mod,
    ast.Pow: operator.pow,
}
_UNARY_OPS = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _eval_number(node: ast.AST) -> int | float:
    if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)) and not isinstance(node.value, bool):
        return node.value
    if isinstance(node, ast.BinOp) and type(node.op) in _BINARY_OPS:
        left, right = _eval_number(node.left), _eval_number(node.right)
        if isinstance(node.op, ast.Pow) and abs(right) > 100:
            raise ValueError("exponent is too large")
        return _BINARY_OPS[type(node.op)](left, right)
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return _UNARY_OPS[type(node.op)](_eval_number(node.operand))
    raise ValueError("only numeric arithmetic is allowed")


def calculator(args: dict[str, Any], _: ToolContext) -> dict[str, Any]:
    expression = str(args["expression"])
    if len(expression) > 200:
        raise ValueError("expression is too long")
    return {"expression": expression, "value": _eval_number(ast.parse(expression, mode="eval").body)}


_SEARCH_DOCS = [
    {"title": "Agent loop", "content": "Agent loop: receive input, ask the model, execute tool calls, feed observations back, and stop on a final answer."},
    {"title": "Context", "content": "Keep recent user/assistant turns and useful tool observations. Compress older turns into a session summary."},
    {"title": "Tool schema", "content": "Each tool exposes a name, a concise description, and a JSON Schema for its arguments."},
]


def mock_search(args: dict[str, Any], _: ToolContext) -> list[dict[str, Any]]:
    query = str(args["query"]).lower()
    limit = int(args.get("limit", 3))
    ranked = sorted(
        _SEARCH_DOCS,
        key=lambda item: sum(word in (item["title"] + " " + item["content"]).lower() for word in query.split()),
        reverse=True,
    )
    return ranked[:limit]


_WEATHER = {
    "北京": {"condition": "晴", "temperature_c": 30},
    "上海": {"condition": "多云", "temperature_c": 29},
    "深圳": {"condition": "阵雨", "temperature_c": 31},
    "香港": {"condition": "雷阵雨", "temperature_c": 30},
}


def weather(args: dict[str, Any], _: ToolContext) -> dict[str, Any]:
    city = str(args["city"])
    data = _WEATHER.get(city, {"condition": "未知（演示数据未覆盖）", "temperature_c": None})
    return {"city": city, "source": "mock-weather", **data}


def todo(args: dict[str, Any], context: ToolContext) -> Any:
    action = args["action"]
    if action == "add":
        text = str(args.get("text") or "").strip()
        if not text:
            raise ValueError("text is required when action=add")
        return context.store.add_todo(context.user_id, context.session_id, text)
    if action == "list":
        return context.store.list_todos(context.user_id, context.session_id)
    raise ValueError(f"unsupported action: {action}")


def build_default_registry() -> ToolRegistry:
    registry = ToolRegistry()
    registry.register(Tool("calculator", "Evaluate a numeric arithmetic expression safely.", {
        "type": "object", "properties": {"expression": {"type": "string"}},
        "required": ["expression"], "additionalProperties": False,
    }, calculator))
    registry.register(Tool("search", "Search a small local mock knowledge base. Use for Agent/runtime concepts.", {
        "type": "object", "properties": {
            "query": {"type": "string"}, "limit": {"type": "integer", "minimum": 1, "maximum": 5}
        }, "required": ["query", "limit"], "additionalProperties": False,
    }, mock_search))
    registry.register(Tool("weather", "Get mock current weather for a Chinese city. Clearly identify it as mock data.", {
        "type": "object", "properties": {"city": {"type": "string"}},
        "required": ["city"], "additionalProperties": False,
    }, weather))
    registry.register(Tool("todo", "Add or list todo items. Todos are isolated by user_id and session_id.", {
        "type": "object", "properties": {
            "action": {"type": "string", "enum": ["add", "list"]},
            "text": {"type": ["string", "null"]},
        }, "required": ["action", "text"], "additionalProperties": False,
    }, todo))
    return registry


def encode_tool_output(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False, default=str)

