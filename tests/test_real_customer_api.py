"""Opt-in integration test for the real customer-service pipeline."""

import os
import tempfile
import unittest
from dataclasses import replace
from pathlib import Path

from min_agent.config import Settings
from min_agent.customer_agent import CustomerServiceAgent

@unittest.skipUnless(
    os.getenv("RUN_REAL_API_TEST") == "1"
    and os.getenv("DASHSCOPE_API_KEY"),
    "real API test is opt-in",
)
class RealCustomerApiTest(unittest.TestCase):
    def test_real_customer_agent_answers(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / "source"
            source.mkdir()
            (source / "测试公司_介绍.md").write_text(
                "# 测试公司\n\n测试公司提供企业智能 Agent 服务。",
                encoding="utf-8",
            )
            settings = replace(
                Settings.from_env(),
                agent_db_path=str(Path(folder) / "agent.db"),
                knowledge_db_path=str(Path(folder) / "knowledge.db"),
                knowledge_source_dir=str(source),
                knowledge_docs_dir=str(Path(folder) / "knowledge_base" / "docs"),
                chroma_db_path=str(Path(folder) / "knowledge_base" / "chroma_db"),
                chroma_collection_name="real-customer-test",
                knowledge_auto_build=True,
                mysql_host="",
                mysql_user="",
                mysql_database="",
            )
            agent = CustomerServiceAgent.from_settings(settings)
            try:
                result = agent.chat("你好，请用一句话介绍你能做什么。", "real-customer")
                self.assertTrue(result.answer.strip())
                self.assertEqual(result.session_id, "real-customer")
            finally:
                agent.close()


if __name__ == "__main__":
    unittest.main()
