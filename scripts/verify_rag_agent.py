"""Run the three acceptance questions through the complete local RAG Agent."""

from __future__ import annotations

import json
import logging
import sys
from dataclasses import replace

from fastapi.testclient import TestClient

from min_agent.api import create_app
from min_agent.config import Settings


CASES = (
    ("华辰服饰有限公司主营业务是什么？", "华辰服饰有限公司_公司介绍.md"),
    ("库存管理流程是什么？", "华辰服饰有限公司_库存管理.pdf"),
    ("生产流程有哪些？", "华辰服饰有限公司_生产流程.pdf"),
)


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )
    settings = replace(
        Settings.from_env(),
        knowledge_auto_build=False,
        mysql_host="",
        mysql_user="",
        mysql_database="",
    )
    print(
        json.dumps(
            {
                "dashscope_api_key_readable": bool(settings.dashscope_api_key),
                "chroma_path": settings.chroma_db_path,
                "collection": settings.chroma_collection_name,
                "embedding_model": settings.dashscope_embedding_model,
                "chat_model": settings.dashscope_chat_model,
            },
            ensure_ascii=False,
            indent=2,
        )
    )

    failures: list[str] = []
    app = create_app(settings)
    with TestClient(app) as client:
        health_response = client.get("/health")
        health_response.raise_for_status()
        print(
            json.dumps(
                {"knowledge_base": "ready", **health_response.json()},
                ensure_ascii=False,
                indent=2,
            )
        )
        for index, (question, expected_source) in enumerate(CASES, start=1):
            response = client.post("/chat", json={"message": question})
            response.raise_for_status()
            result = response.json()
            sources = [str(source.get("filename")) for source in result["sources"]]
            passed = expected_source in sources
            if not passed:
                failures.append(f"case {index}: expected {expected_source}, got {sources}")
            print(
                json.dumps(
                    {
                        "case": index,
                        "question": question,
                        "expected_source": expected_source,
                        "session_id": result["session_id"],
                        "retrieved_sources": result["sources"],
                        "source_check": "passed" if passed else "failed",
                        "answer": result["answer"],
                    },
                    ensure_ascii=False,
                    indent=2,
                )
            )

    if failures:
        print("\n".join(failures), file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
