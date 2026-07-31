from __future__ import annotations

import json

from min_agent.config import Settings
from min_agent.knowledge import ChromaKnowledgeBase


TEST_CASES = (
    ("华辰服饰公司的主营业务是什么？", "华辰服饰有限公司_公司介绍.md"),
    ("库存管理流程是什么？", "华辰服饰有限公司_库存管理.pdf"),
    ("生产流程有哪些步骤？", "华辰服饰有限公司_生产流程.pdf"),
)


def main() -> None:
    knowledge = ChromaKnowledgeBase.from_settings(Settings.from_env())
    failures: list[str] = []
    results: list[dict[str, object]] = []
    try:
        for query, expected_source in TEST_CASES:
            hits = knowledge.search(query, limit=3)
            sources = [hit.filename for hit in hits]
            results.append(
                {
                    "query": query,
                    "expected_source": expected_source,
                    "retrieved_sources": sources,
                    "passed": expected_source in sources,
                }
            )
            if expected_source not in sources:
                failures.append(f"{query} -> expected {expected_source}, got {sources}")
    finally:
        knowledge.close()
    print(json.dumps(results, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit("Knowledge retrieval verification failed:\n" + "\n".join(failures))


if __name__ == "__main__":
    main()
