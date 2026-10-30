"""Search result TTL cache — backed by market_search_cache table."""

from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Any

from ydsz.infra.market.constants import DEFAULT_SEARCH_CACHE_TTL

logger = logging.getLogger(__name__)


class SearchCache:
    """TTL cache for cross-type market search results.

    Uses SQLite for persistence; in-process dict for hot reads.
    """

    def __init__(self, ttl: int = DEFAULT_SEARCH_CACHE_TTL) -> None:
        self._ttl = ttl
        self._hot: dict[str, dict[str, Any]] = {}

    @staticmethod
    def make_key(
        *,
        query: str,
        types: tuple[str, ...],
        category: str | None,
        sort: str,
        locale: str,
        page: int,
    ) -> str:
        """Deterministic cache key from search params."""
        raw = json.dumps(
            [query, list(types), category, sort, locale, page],
            sort_keys=True,
        )
        return hashlib.sha256(raw.encode()).hexdigest()

    async def get(self, key: str) -> dict[str, Any] | None:
        """Return cached payload if not expired, else None."""
        # Hot cache first.
        entry = self._hot.get(key)
        if entry and entry["expires_at"] > time.time():
            return entry["value"]
        if entry:
            del self._hot[key]

        # Database fallback (shared across workers).
        try:
            from ydsz.infra.db.services import SharedServices
            db = SharedServices.instance().db if SharedServices.instance() else None
        except Exception:
            db = None

        if db is None:
            return None

        try:
            rows = db.fetchall(
                "SELECT results_json, total, per_type_json FROM market_search_cache "
                "WHERE cache_key = ? AND expires_at > ?",
                [key, _now_str()],
            )
        except Exception:
            return None

        if not rows:
            return None

        try:
            payload = json.loads(rows[0]["results_json"])
            payload["total"] = rows[0]["total"]
            payload["per_type"] = json.loads(rows[0]["per_type_json"] or "{}")
        except (json.JSONDecodeError, KeyError):
            return None

        # Populate hot cache.
        self._hot[key] = {
            "value": payload,
            "expires_at": time.time() + self._ttl,
        }
        return payload

    async def set(
        self,
        key: str,
        value: dict[str, Any],
        ttl: int | None = None,
    ) -> None:
        """Persist payload to DB + hot cache."""
        effective_ttl = ttl or self._ttl
        expires_at = time.time() + effective_ttl

        # Hot cache.
        self._hot[key] = {
            "value": value,
            "expires_at": expires_at,
        }

        # DB persist.
        try:
            from ydsz.infra.db.services import SharedServices
            db = SharedServices.instance().db if SharedServices.instance() else None
        except Exception:
            db = None

        if db is None:
            return

        try:
            db.execute(
                "INSERT OR REPLACE INTO market_search_cache "
                "(cache_key, item_type, query, category, sort, locale, "
                "results_json, total, per_type_json, expires_at) "
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                [
                    key,
                    value.get("item_type"),
                    value.get("query", ""),
                    value.get("category"),
                    value.get("sort", "relevance"),
                    value.get("locale", "zh"),
                    json.dumps(value.get("items", [])),
                    value.get("total", 0),
                    json.dumps(value.get("per_type", {})),
                    _now_str(expires_at),
                ],
            )
        except Exception:
            logger.debug("Search cache write failed (non-fatal)", exc_info=True)

    async def invalidate(self) -> None:
        """Clear all cache entries (after install/uninstall)."""
        self._hot.clear()
        try:
            from ydsz.infra.db.services import SharedServices
            db = SharedServices.instance().db if SharedServices.instance() else None
            if db is not None:
                db.execute("DELETE FROM market_search_cache")
        except Exception:
            pass


def _now_str(timestamp: float | None = None) -> str:
    """Format timestamp as SQLite-compatible UTC datetime string."""
    ts = timestamp or time.time()
    return time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(ts))
