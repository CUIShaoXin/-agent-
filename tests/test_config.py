import os
import unittest
from unittest.mock import patch

from min_agent.config import Settings


class SettingsTests(unittest.TestCase):
    def test_production_aliases_override_legacy_names(self):
        with patch.dict(
            os.environ,
            {
                "MODEL_NAME": "qwen-max",
                "DASHSCOPE_CHAT_MODEL": "legacy-model",
                "CHROMA_PERSIST_DIR": "/app/chroma_db",
                "CHROMA_DB_PATH": "legacy/chroma_db",
                "KNOWLEDGE_SOURCE_DIR": "/app/knowledge_base",
            },
            clear=True,
        ):
            settings = Settings.from_env()

        self.assertEqual(settings.dashscope_chat_model, "qwen-max")
        self.assertEqual(settings.chroma_db_path, "/app/chroma_db")
        self.assertEqual(settings.knowledge_source_dir, "/app/knowledge_base")

    def test_local_defaults_are_platform_independent(self):
        with patch.dict(os.environ, {}, clear=True):
            settings = Settings.from_env()

        self.assertEqual(settings.knowledge_source_dir, "knowledge_base/docs")
        self.assertEqual(settings.chroma_db_path, "knowledge_base/chroma_db")


if __name__ == "__main__":
    unittest.main()
