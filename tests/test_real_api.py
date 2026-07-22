"""Opt-in integration test: set RUN_REAL_API_TEST=1 and OPENAI_API_KEY."""

import os
import tempfile
import unittest
from pathlib import Path

from min_agent.llm import OpenAIResponsesLLM
from min_agent.runtime import AgentRuntime
from min_agent.storage import SQLiteStore
from min_agent.tools import build_default_registry


@unittest.skipUnless(os.getenv("RUN_REAL_API_TEST") == "1" and os.getenv("OPENAI_API_KEY"), "real API test is opt-in")
class RealAPITest(unittest.TestCase):
    def test_real_model_uses_calculator(self):
        with tempfile.TemporaryDirectory() as folder:
            store = SQLiteStore(str(Path(folder) / "real.db"))
            try:
                runtime = AgentRuntime(OpenAIResponsesLLM(), build_default_registry(), store)
                answer = runtime.run("integration", "calculator", "请用计算器算 17*23，只告诉我结果")
                self.assertIn("391", answer)
                self.assertIn("tool_result", [t["event"] for t in store.get_traces("calculator")])
            finally:
                store.close()


if __name__ == "__main__":
    unittest.main()
