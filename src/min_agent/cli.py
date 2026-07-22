from __future__ import annotations

import argparse
import json
import os

from .llm import OpenAIResponsesLLM
from .runtime import AgentRuntime
from .storage import SQLiteStore
from .tools import build_default_registry


def build_runtime() -> AgentRuntime:
    return AgentRuntime(
        OpenAIResponsesLLM(),
        build_default_registry(),
        SQLiteStore(os.getenv("AGENT_DB_PATH", "data/agent.db")),
        max_steps=int(os.getenv("AGENT_MAX_STEPS", "6")),
        context_messages=int(os.getenv("AGENT_CONTEXT_MESSAGES", "12")),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Minimal Agent CLI")
    parser.add_argument("--user", default="user-a", help="user id")
    parser.add_argument("--session", required=True, help="window/session id")
    parser.add_argument("--once", help="send one message and exit")
    parser.add_argument("--trace", action="store_true", help="print this session's traces after exit")
    args = parser.parse_args()
    try:
        runtime = build_runtime()
    except ValueError as exc:
        parser.error(str(exc))
    if args.once:
        print(runtime.run(args.user, args.session, args.once))
    else:
        print(f"Minimal Agent | user={args.user} session={args.session} | 输入 /exit 退出")
        while True:
            try:
                text = input("you> ").strip()
            except (EOFError, KeyboardInterrupt):
                print()
                break
            if text in {"/exit", "/quit"}:
                break
            if text:
                print("agent>", runtime.run(args.user, args.session, text))
    if args.trace:
        print(json.dumps(runtime.store.get_traces(args.session, args.user), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
