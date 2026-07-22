from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class SQLiteStore:
    """Persistent session memory and trace store, intentionally kept small."""

    def __init__(self, path: str = "data/agent.db") -> None:
        self.path = path
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._db = sqlite3.connect(path, check_same_thread=False)
        self._db.row_factory = sqlite3.Row
        self._lock = threading.RLock()
        self._init_schema()

    def _init_schema(self) -> None:
        with self._db:
            self._db.executescript("""
                CREATE TABLE IF NOT EXISTS sessions (
                    user_id TEXT NOT NULL, session_id TEXT NOT NULL,
                    summary TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL, PRIMARY KEY (user_id, session_id)
                );
                CREATE TABLE IF NOT EXISTS messages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
                    session_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL,
                    name TEXT, compacted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS todos (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL,
                    session_id TEXT NOT NULL, text TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0,
                    created_at TEXT NOT NULL
                );
                CREATE TABLE IF NOT EXISTS traces (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL,
                    user_id TEXT NOT NULL, session_id TEXT NOT NULL, step INTEGER NOT NULL,
                    event TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL
                );
            """)

    def ensure_session(self, user_id: str, session_id: str) -> None:
        now = _now()
        with self._lock, self._db:
            self._db.execute(
                "INSERT OR IGNORE INTO sessions(user_id,session_id,created_at,updated_at) VALUES(?,?,?,?)",
                (user_id, session_id, now, now),
            )

    def add_message(self, user_id: str, session_id: str, role: str, content: str, name: str | None = None) -> None:
        self.ensure_session(user_id, session_id)
        with self._lock, self._db:
            self._db.execute(
                "INSERT INTO messages(user_id,session_id,role,content,name,created_at) VALUES(?,?,?,?,?,?)",
                (user_id, session_id, role, content, name, _now()),
            )
            self._db.execute("UPDATE sessions SET updated_at=? WHERE user_id=? AND session_id=?", (_now(), user_id, session_id))

    def get_context(self, user_id: str, session_id: str, limit: int) -> list[dict[str, str]]:
        self.ensure_session(user_id, session_id)
        session = self._db.execute(
            "SELECT summary FROM sessions WHERE user_id=? AND session_id=?", (user_id, session_id)
        ).fetchone()
        rows = self._db.execute(
            "SELECT role,content,name FROM messages WHERE user_id=? AND session_id=? AND compacted=0 ORDER BY id DESC LIMIT ?",
            (user_id, session_id, limit),
        ).fetchall()[::-1]
        context: list[dict[str, str]] = []
        if session and session["summary"]:
            context.append({"role": "developer", "content": "Earlier session summary:\n" + session["summary"]})
        for row in rows:
            if row["role"] == "tool":
                context.append({"role": "user", "content": f"Previous tool observation ({row['name']}): {row['content']}"})
            else:
                context.append({"role": row["role"], "content": row["content"]})
        return context

    def compact(self, user_id: str, session_id: str, keep_recent: int) -> bool:
        rows = self._db.execute(
            "SELECT id,role,content,name FROM messages WHERE user_id=? AND session_id=? AND compacted=0 ORDER BY id",
            (user_id, session_id),
        ).fetchall()
        if len(rows) <= keep_recent:
            return False
        old = rows[:-keep_recent]
        snippets = []
        for row in old:
            label = f"tool:{row['name']}" if row["role"] == "tool" else row["role"]
            normalized = " ".join(row["content"].split())[:240]
            snippets.append(f"- {label}: {normalized}")
        previous = self._db.execute(
            "SELECT summary FROM sessions WHERE user_id=? AND session_id=?", (user_id, session_id)
        ).fetchone()["summary"]
        merged = ((previous + "\n") if previous else "") + "\n".join(snippets)
        ids = [row["id"] for row in old]
        placeholders = ",".join("?" for _ in ids)
        with self._lock, self._db:
            self._db.execute("UPDATE sessions SET summary=?,updated_at=? WHERE user_id=? AND session_id=?", (merged[-4000:], _now(), user_id, session_id))
            self._db.execute(f"UPDATE messages SET compacted=1 WHERE id IN ({placeholders})", ids)
        return True

    def add_todo(self, user_id: str, session_id: str, text: str) -> dict[str, Any]:
        with self._lock, self._db:
            cursor = self._db.execute(
                "INSERT INTO todos(user_id,session_id,text,created_at) VALUES(?,?,?,?)",
                (user_id, session_id, text, _now()),
            )
        return {"id": cursor.lastrowid, "text": text, "done": False}

    def list_todos(self, user_id: str, session_id: str) -> list[dict[str, Any]]:
        rows = self._db.execute(
            "SELECT id,text,done FROM todos WHERE user_id=? AND session_id=? ORDER BY id", (user_id, session_id)
        ).fetchall()
        return [{"id": row["id"], "text": row["text"], "done": bool(row["done"])} for row in rows]

    def trace(self, run_id: str, user_id: str, session_id: str, step: int, event: str, payload: Any) -> None:
        with self._lock, self._db:
            self._db.execute(
                "INSERT INTO traces(run_id,user_id,session_id,step,event,payload,created_at) VALUES(?,?,?,?,?,?,?)",
                (run_id, user_id, session_id, step, event, json.dumps(payload, ensure_ascii=False, default=str), _now()),
            )

    def get_traces(self, session_id: str, user_id: str | None = None) -> list[dict[str, Any]]:
        if user_id is None:
            rows = self._db.execute(
                "SELECT run_id,step,event,payload,created_at FROM traces WHERE session_id=? ORDER BY id", (session_id,)
            ).fetchall()
        else:
            rows = self._db.execute(
                "SELECT run_id,step,event,payload,created_at FROM traces WHERE user_id=? AND session_id=? ORDER BY id",
                (user_id, session_id),
            ).fetchall()
        return [{**dict(row), "payload": json.loads(row["payload"])} for row in rows]

    def get_summary(self, user_id: str, session_id: str) -> str:
        row = self._db.execute(
            "SELECT summary FROM sessions WHERE user_id=? AND session_id=?", (user_id, session_id)
        ).fetchone()
        return row["summary"] if row else ""

    def close(self) -> None:
        self._db.close()
