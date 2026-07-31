import json
import unittest
from unittest.mock import patch

from min_agent.dashscope_service import DashScopeService


class FakeMessage:
    def __init__(self, content):
        self.content = content


class FakeChoice:
    def __init__(self, content):
        self.message = FakeMessage(content)


class FakeOutput:
    def __init__(self, content):
        self.choices = [FakeChoice(content)]


class FakeResponse:
    status_code = 200

    def __init__(self, content):
        self.output = FakeOutput(content)


class DashScopeServiceTests(unittest.TestCase):
    def setUp(self):
        self.service = DashScopeService("test-key", "qwen-plus", retries=0)

    @patch("min_agent.dashscope_service.Generation.call")
    def test_respond_uses_qwen_and_environment_key(self, call):
        call.return_value = FakeResponse("企业知识库回答")

        answer = self.service.respond(
            "你是企业客服",
            [{"role": "user", "content": "主营业务是什么？"}],
        )

        self.assertEqual(answer, "企业知识库回答")
        kwargs = call.call_args.kwargs
        self.assertEqual(kwargs["api_key"], "test-key")
        self.assertEqual(kwargs["model"], "qwen-plus")
        self.assertEqual(kwargs["result_format"], "message")

    @patch("min_agent.dashscope_service.Generation.call")
    def test_structured_parses_json_intent(self, call):
        call.return_value = FakeResponse(
            json.dumps(
                {
                    "intent": "knowledge",
                    "needs_database": False,
                    "rewritten_query": "华辰服饰有限公司主营业务",
                },
                ensure_ascii=False,
            )
        )

        result = self.service.structured(
            "识别意图",
            "主营业务是什么？",
            name="customer_intent",
            schema={"type": "object"},
        )

        self.assertEqual(result["intent"], "knowledge")
        self.assertEqual(
            call.call_args.kwargs["response_format"],
            {"type": "json_object"},
        )


if __name__ == "__main__":
    unittest.main()
