"""SearchService — cross-provider parallel search + aggregate."""

from __future__ import annotations

import asyncio
import contextlib
import logging
from typing import Any

from ydsz.infra.market.cache import SearchCache
from ydsz.infra.market.constants import DEFAULT_LIMIT
from ydsz.infra.market.models import MarketItem, MarketListResult
from ydsz.infra.market.providers import get_provider

logger = logging.getLogger(__name__)


class SearchService:
    """Parallel search across N providers -> normalise -> aggregate."""

    def __init__(self, cache: SearchCache | None = None) -> None:
        self._cache = cache or SearchCache()

    async def search(
        self,
        query: str,
        types: list[str] | None = None,
        *,
        category: str | None = None,
        sort: str = "relevance",
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
        locale: str | None = None,
    ) -> dict[str, Any]:
        """Search across providers and aggregate.

        Returns::
            {
                "items": [dict, ...],
                "total": int,
                "per_type": {type: int, ...},
                "query": str,
                "limit": int,
                "offset": int,
            }
        """
        types = list(types or ["skill", "expert", "plugin", "connector"])
        page = offset // limit if limit > 0 else 0

        # Cache lookup.
        if len(query) >= 2:
            cache_key = self._cache.make_key(
                query=query, types=tuple(types), category=category,
                sort=sort, locale=locale or "zh", page=page,
            )
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return cached

        # Parallel search.
        tasks: dict[str, Any] = {}
        for t in types:
            try:
                provider = get_provider(t)
                tasks[t] = asyncio.create_task(
                    provider.search(
                        query, category=category, sort=sort,
                        limit=limit, offset=0, locale=locale,
                    )
                )
            except Exception as exc:
                logger.warning("Provider %s unavailable: %s", t, exc)
                tasks[t] = exc

        results: dict[str, Any] = {}
        for t, task in tasks.items():
            if isinstance(task, Exception):
                results[t] = task
                continue
            try:
                results[t] = await task
            except Exception as exc:
                results[t] = exc

        # Aggregate.
        all_items: list[MarketItem] = []
        per_type: dict[str, int] = {}
        for t, result in results.items():
            if isinstance(result, Exception):
                per_type[t] = 0
                continue
            if isinstance(result, MarketListResult):
                per_type[t] = result.total
                all_items.extend(result.items)
            else:
                per_type[t] = 0

        # Sort aggregate.
        if sort == "downloads":
            all_items.sort(key=lambda i: i.downloads, reverse=True)
        elif sort == "rating":
            all_items.sort(key=lambda i: i.rating or 0, reverse=True)
        elif sort == "newest":
            all_items.sort(key=lambda i: i.updated_at or "", reverse=True)

        total = len(all_items)
        page_items = all_items[offset:offset + limit]

        output = {
            "items": [_item_to_dict(i) for i in page_items],
            "total": total,
            "per_type": per_type,
            "query": query,
            "limit": limit,
            "offset": offset,
        }

        # Write cache.
        if len(query) >= 2:
            with contextlib.suppress(Exception):
                await self._cache.set(cache_key, output)

        return output


def _item_to_dict(item: MarketItem) -> dict[str, Any]:
    """Serialise a MarketItem for JSON response."""
    return {
        "market_id": item.market_id,
        "type": item.type,
        "source": item.source,
        "identity": item.identity,
        "name": item.name,
        "description": item.description,
        "icon_url": item.icon_url,
        "icon_name": item.icon_name,
        "color": item.color,
        "version": item.version,
        "author": {"name": item.author.name, "url": item.author.url} if item.author else None,
        "category": item.category,
        "tags": list(item.tags),
        "rating": item.rating,
        "downloads": item.downloads,
        "installed": item.installed,
        "installed_version": item.installed_version,
        "has_update": item.has_update,
        "size_bytes": item.size_bytes,
        "source_url": item.source_url,
        "updated_at": item.updated_at,
    }
