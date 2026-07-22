import json
import tempfile
import unittest
from pathlib import Path

from min_agent.llm import ResponseParser, ScriptedLLM
from min_agent.models import ModelTurn, ToolCall
from min_agent.runtime import AgentRuntime
from min_agent.storage import SQLiteStore
from min_agent.tools import build_default_registry


class AgentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.store = SQLiteStore(str(Path(self.temp.name) / "test.db"))
        self.tools = build_default_registry()

    def tearDown(self):
        self.store.close()
        self.temp.cleanup()

    def runtime(self, turns, **kwargs):
        llm = ScriptedLLM(turns)
        return AgentRuntime(llm, self.tools, self.store, **kwargs), llm

    def test_direct_answer(self):
        runtime, _ = self.runtime([ModelTurn(final_answer="你好！")])
        self.assertEqual(runtime.run("A", "w1", "你好"), "你好！")

    def test_tool_loop_and_continuation(self):
        call_item = {"type": "function_call", "call_id": "c1", "name": "calculator", "arguments": '{"expression":"2+3*4"}'}
        runtime, llm = self.runtime([
            ModelTurn(tool_calls=[ToolCall("c1", "calculator", {"expression": "2+3*4"})], response_items=[call_item]),
            ModelTurn(final_answer="结果是 14。"),
        ])
        self.assertEqual(runtime.run("A", "w1", "算一下 2+3*4"), "结果是 14。")
        continuation = llm.requests[1]["continuation_items"]
        observation = next(item for item in continuation if item["type"] == "function_call_output")
        self.assertEqual(json.loads(observation["output"])["result"]["value"], 14)

    def test_multiple_tool_calls_in_one_model_turn(self):
        runtime, llm = self.runtime([
            ModelTurn(tool_calls=[
                ToolCall("w", "weather", {"city": "深圳"}),
                ToolCall("t", "todo", {"action": "add", "text": "下班带伞"}),
            ]),
            ModelTurn(final_answer="深圳有阵雨（mock），已添加待办。"),
        ])
        answer = runtime.run("A", "window-1", "查深圳天气并记下下班带伞")
        self.assertIn("阵雨", answer)
        outputs = [x for x in llm.requests[1]["continuation_items"] if x["type"] == "function_call_output"]
        self.assertEqual(len(outputs), 2)
        self.assertEqual(self.store.list_todos("A", "window-1")[0]["text"], "下班带伞")

    def test_session_isolation_for_todos(self):
        runtime1, _ = self.runtime([
            ModelTurn(tool_calls=[ToolCall("a", "todo", {"action": "add", "text": "查天气"})]),
            ModelTurn(final_answer="已记下。"),
        ])
        runtime1.run("A", "window-1", "记待办：查天气")
        runtime2, _ = self.runtime([
            ModelTurn(tool_calls=[ToolCall("b", "todo", {"action": "add", "text": "写周报"})]),
            ModelTurn(final_answer="已记下。"),
        ])
        runtime2.run("A", "window-2", "记待办：写周报")
        self.assertEqual([x["text"] for x in self.store.list_todos("A", "window-1")], ["查天气"])
        self.assertEqual([x["text"] for x in self.store.list_todos("A", "window-2")], ["写周报"])

    def test_follow_up_receives_previous_context(self):
        runtime, _ = self.runtime([ModelTurn(final_answer="你说的是深圳。")])
        runtime.run("A", "w1", "我在深圳")
        runtime2, llm = self.runtime([ModelTurn(final_answer="你刚才说深圳。")])
        runtime2.run("A", "w1", "我刚才说哪里？")
        contents = [item["content"] for item in llm.requests[0]["context"]]
        self.assertTrue(any("深圳" in content for content in contents))

    def test_context_compaction(self):
        for i in range(10):
            self.store.add_message("A", "long", "user", f"old-{i}")
        runtime, _ = self.runtime([ModelTurn(final_answer="ok")], context_messages=4)
        runtime.run("A", "long", "new")
        self.assertIn("old-0", self.store.get_summary("A", "long"))
        self.assertLessEqual(len(self.store.get_context("A", "long", 4)), 5)

    def test_max_steps_stops_infinite_tool_loop(self):
        turns = [ModelTurn(tool_calls=[ToolCall(f"c{i}", "calculator", {"expression": "1+1"})]) for i in range(2)]
        runtime, _ = self.runtime(turns, max_steps=2)
        self.assertIn("最大执行步数", runtime.run("A", "w1", "不停计算"))

    def test_tool_errors_are_observations(self):
        runtime, llm = self.runtime([
            ModelTurn(tool_calls=[ToolCall("x", "missing", {})]),
            ModelTurn(final_answer="工具不存在，无法执行。"),
        ])
        runtime.run("A", "w1", "调用不存在的工具")
        output = next(x for x in llm.requests[1]["continuation_items"] if x["type"] == "function_call_output")
        self.assertFalse(json.loads(output["output"])["ok"])

    def test_response_parser_extracts_summary_call_and_answer(self):
        parsed = ResponseParser.parse({"output": [
            {"type": "reasoning", "summary": [{"type": "summary_text", "text": "需要计算"}]},
            {"type": "function_call", "call_id": "c1", "name": "calculator", "arguments": '{"expression":"6*7"}'},
        ]})
        self.assertEqual(parsed.decision_summary, "需要计算")
        self.assertEqual(parsed.tool_calls[0].arguments["expression"], "6*7")
        final = ResponseParser.parse({"output": [{"type": "message", "content": [{"type": "output_text", "text": "42"}]}]})
        self.assertEqual(final.final_answer, "42")

    def test_malformed_tool_arguments_become_recoverable_error(self):
        parsed = ResponseParser.parse({"output": [
            {"type": "function_call", "call_id": "bad", "name": "calculator", "arguments": "{broken"}
        ]})
        self.assertIn("__parse_error__", parsed.tool_calls[0].arguments)
        result = self.tools.execute("calculator", parsed.tool_calls[0].arguments, None)
        self.assertFalse(result["ok"])

    def test_trace_contains_tool_result(self):
        runtime, _ = self.runtime([
            ModelTurn(tool_calls=[ToolCall("c", "weather", {"city": "深圳"})]),
            ModelTurn(final_answer="深圳有阵雨（mock）。"),
        ])
        runtime.run("A", "trace-session", "深圳天气")
        events = [item["event"] for item in self.store.get_traces("trace-session")]
        self.assertIn("tool_result", events)
        self.assertIn("run_end", events)

    def test_trace_query_can_isolate_same_session_name_by_user(self):
        self.store.trace("r1", "A", "same", 0, "event-a", {})
        self.store.trace("r2", "B", "same", 0, "event-b", {})
        self.assertEqual([x["event"] for x in self.store.get_traces("same", "A")], ["event-a"])


if __name__ == "__main__":
    unittest.main()
