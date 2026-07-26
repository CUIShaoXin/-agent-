from __future__ import annotations

import re
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from .config import Settings


_DANGEROUS_SQL = re.compile(
    r"\b(insert|update|delete|replace|drop|alter|truncate|create|grant|revoke|call|load|outfile|dumpfile|sleep|benchmark|lock|unlock)\b",
    re.IGNORECASE,
)
_SYSTEM_SCHEMA = re.compile(r"\b(information_schema|performance_schema|mysql|sys)\b", re.IGNORECASE)
_TABLE_REFERENCE = re.compile(r"\b(?:from|join)\s+`?([a-zA-Z_][\w$]*)`?", re.IGNORECASE)


class MySQLDatabase:
    """Lazy MySQL client restricted to read-only SELECT/CTE queries."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @property
    def configured(self) -> bool:
        return self.settings.mysql_configured

    def _connect(self):
        if not self.configured:
            raise RuntimeError("MySQL is not configured")
        try:
            import pymysql
        except ImportError as exc:
            raise RuntimeError("MySQL support requires pymysql") from exc
        return pymysql.connect(
            host=self.settings.mysql_host,
            port=self.settings.mysql_port,
            user=self.settings.mysql_user,
            password=self.settings.mysql_password,
            database=self.settings.mysql_database,
            charset="utf8mb4",
            autocommit=False,
            connect_timeout=5,
            read_timeout=15,
            write_timeout=5,
            cursorclass=pymysql.cursors.DictCursor,
        )

    def schema_summary(self) -> str:
        sql = """
            SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = %s
            ORDER BY TABLE_NAME, ORDINAL_POSITION
        """
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute(sql, (self.settings.mysql_database,))
            rows = cursor.fetchall()
        allowed = set(self.settings.mysql_allowed_tables)
        grouped: dict[str, list[str]] = {}
        for row in rows:
            table = str(row["TABLE_NAME"])
            if allowed and table not in allowed:
                continue
            grouped.setdefault(table, []).append(f"{row['COLUMN_NAME']} {row['DATA_TYPE']}")
        if not grouped:
            raise RuntimeError("No allowed MySQL tables were found")
        return "\n".join(f"{table}({', '.join(columns)})" for table, columns in grouped.items())

    def _validate(self, sql: str) -> str:
        normalized = " ".join(sql.strip().split())
        if not normalized:
            raise ValueError("SQL cannot be empty")
        if ";" in normalized or "--" in normalized or "/*" in normalized or "#" in normalized:
            raise ValueError("SQL comments and multiple statements are not allowed")
        if not re.match(r"^select\b", normalized, flags=re.IGNORECASE):
            raise ValueError("Only SELECT queries are allowed")
        if _DANGEROUS_SQL.search(normalized) or _SYSTEM_SCHEMA.search(normalized):
            raise ValueError("Unsafe SQL was blocked")
        allowed = set(self.settings.mysql_allowed_tables)
        if allowed:
            referenced = set(_TABLE_REFERENCE.findall(normalized))
            disallowed = sorted(table for table in referenced if table not in allowed)
            if disallowed:
                raise ValueError(f"Tables are not allowed: {', '.join(disallowed)}")
        if not re.search(r"\blimit\s+\d+\b", normalized, flags=re.IGNORECASE):
            normalized += f" LIMIT {self.settings.mysql_max_rows}"
        return normalized

    @staticmethod
    def _json_value(value: Any) -> Any:
        if isinstance(value, Decimal):
            return float(value)
        if isinstance(value, (datetime, date)):
            return value.isoformat()
        if isinstance(value, bytes):
            return value.decode("utf-8", errors="replace")
        if isinstance(value, str):
            return value[:2000]
        return value

    def query(self, sql: str) -> dict[str, Any]:
        safe_sql = self._validate(sql)
        with self._connect() as connection, connection.cursor() as cursor:
            cursor.execute("SET TRANSACTION READ ONLY")
            cursor.execute("SET SESSION MAX_EXECUTION_TIME=10000")
            cursor.execute(safe_sql)
            rows = cursor.fetchall()
            connection.rollback()
        return {
            "sql": safe_sql,
            "row_count": len(rows),
            "rows": [
                {key: self._json_value(value) for key, value in row.items()}
                for row in rows
            ],
        }
