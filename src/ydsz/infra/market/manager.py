"""MarketManager — unified facade over all market providers.

This is the primary entry point for the API layer.  It orchestrates
provider selection, cross-type search, installation, and the installed view.
"""

from __future__ import annotations

import contextlib
import logging
from typing import Any

from ydsz.infra.market.constants import (
    DEFAULT_LIMIT,
    MARKET_ITEM_TYPES,
)
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.install import InstallService
from ydsz.infra.market.models import (
    InstallReceipt,
    InstallTarget,
)
from ydsz.infra.market.providers import get_provider
from ydsz.infra.market.search import SearchService

logger = logging.getLogger(__name__)


class MarketManager:
    """Unified marketplace facade.

    Usage::

        manager = MarketManager(db=server.services.db)
        result = await manager.search("gmail")
        receipt = await manager.install("skill", "gmail-manager", target=..., user_id=1)
    """

    def __init__(
        self,
        *,
        db: Any = None,
        install_service: InstallService | None = None,
        search_service: SearchService | None = None,
    ) -> None:
        self._db = db
        self._install = install_service or InstallService(db=db)
        self._search = search_service or SearchService()

    # ── Properties ──────────────────────────────────────────────────────
    @property
    def available_types(self) -> list[str]:
        return list(MARKET_ITEM_TYPES)

    # ── Provider access ─────────────────────────────────────────────────
    def provider(self, type: str) -> Any:
        try:
            return get_provider(type)
        except MarketError:
            raise
        except Exception as exc:
            raise MarketError(
                MarketErrorCode.UNSUPPORTED_TYPE,
                f"provider for {type!r} unavailable: {exc}",
            ) from exc

    # ── Browse / search ─────────────────────────────────────────────────
    async def browse(
        self,
        type: str,
        *,
        category: str | None = None,
        sort: str = "relevance",
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
        locale: str | None = None,
    ) -> dict[str, Any]:
        """Browse one market type."""
        p = self.provider(type)
        result = await p.list_items(
            category=category, sort=sort,
            limit=limit, offset=offset, locale=locale,
        )
        return {
            "items": [_item_to_dict(i) for i in result.items],
            "total": result.total,
            "limit": result.limit,
            "offset": result.offset,
            "sort": result.sort,
            "category": result.category,
            "type": type,
        }

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
        """Cross-type aggregated search."""
        return await self._search.search(
            query, types, category=category, sort=sort,
            limit=limit, offset=offset, locale=locale,
        )

    async def detail(
        self,
        type: str,
        identity: str,
        *,
        locale: str | None = None,
    ) -> dict[str, Any]:
        """Full detail for drawer."""
        p = self.provider(type)
        d = await p.detail(identity, locale=locale, db=self._db)
        return _detail_to_dict(d)

    # ── Install ──────────────────────────────────────────────────────────
    async def install(
        self,
        type: str,
        identity: str,
        *,
        target: InstallTarget,
        user_id: int,
        **opts: Any,
    ) -> dict[str, Any]:
        """Install one capability.  Returns serialised receipt."""
        p = self.provider(type)
        receipt = await self._install.execute(
            provider=p, identity=identity, target=target,
            user_id=user_id, **opts,
        )
        # Invalidate search cache after install.
        with contextlib.suppress(Exception):
            await self._search._cache.invalidate()
        return _receipt_to_dict(receipt)

    async def update(
        self,
        type: str,
        identity: str,
        *,
        installed: dict[str, Any],
        target: InstallTarget,
        user_id: int,
        **opts: Any,
    ) -> dict[str, Any]:
        p = self.provider(type)
        receipt = await self._install.update(
            provider=p, identity=identity, installed=installed,
            target=target, user_id=user_id, **opts,
        )
        with contextlib.suppress(Exception):
            await self._search._cache.invalidate()
        return _receipt_to_dict(receipt)

    # ── Installed view ──────────────────────────────────────────────────
    async def installed(
        self,
        *,
        user_id: int,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> list[dict[str, Any]]:
        """Return installed items across all types for one user."""
        return await self._install.installed_across_types(
            user_id=user_id, limit=limit, offset=offset,
        )

    async def check_updates(
        self,
        type: str,
        *,
        user_id: int,
    ) -> list[dict[str, Any]]:
        """Check updates for all installed items of a given type."""
        p = self.provider(type)
        installed = await p.installed_list(
            user_id=user_id, db=self._db,
        )
        results = []
        for inst in installed:
            info = await p.check_update(
                installed_version=inst.get("installed_version", ""),
                identity=inst.get("identity", ""),
                source=inst.get("source"),
                db=self._db,
            )
            if info is not None:
                results.append({
                    "market_id": info.market_id,
                    "installed_version": info.installed_version,
                    "latest_version": info.latest_version,
                    "changelog": info.changelog,
                })
        return results

    # ── Categories ─────────────────────────────────────────────────────
    async def categories(self, type: str) -> list[dict[str, str]]:
        """Return category facets for one market type."""
        p = self.provider(type)
        return await p.categories()


# ── Serialisers ─────────────────────────────────────────────────────────
def _item_to_dict(item: Any) -> dict[str, Any]:
    d = {
        "market_id": getattr(item, "market_id", ""),
        "type": getattr(item, "type", ""),
        "source": getattr(item, "source", ""),
        "identity": getattr(item, "identity", ""),
        "name": getattr(item, "name", ""),
        "description": getattr(item, "description", ""),
        "icon_url": getattr(item, "icon_url", None),
        "icon_name": getattr(item, "icon_name", None),
        "color": getattr(item, "color", None),
        "version": getattr(item, "version", ""),
        "category": getattr(item, "category", ""),
        "tags": list(getattr(item, "tags", ())),
        "rating": getattr(item, "rating", None),
        "downloads": getattr(item, "downloads", 0),
        "installed": getattr(item, "installed", False),
        "installed_version": getattr(item, "installed_version", None),
        "has_update": getattr(item, "has_update", False),
        "size_bytes": getattr(item, "size_bytes", None),
        "source_url": getattr(item, "source_url", None),
        "updated_at": getattr(item, "updated_at", None),
    }
    author = getattr(item, "author", None)
    if author:
        d["author"] = {"name": author.name, "url": author.url}
    return d


def _detail_to_dict(d: Any) -> dict[str, Any]:
    base = _item_to_dict(d)
    base |= {
        "readme": getattr(d, "readme", None),
        "screenshots": list(getattr(d, "screenshots", ())),
        "changelog": getattr(d, "changelog", None),
        "dependencies": list(getattr(d, "dependencies", ())),
        "quick_prompts": list(getattr(d, "quick_prompts", ())),
        "metadata": getattr(d, "metadata", {}),
    }
    return base


def _receipt_to_dict(receipt: InstallReceipt) -> dict[str, Any]:
    return {
        "market_item": _item_to_dict(receipt.market_item),
        "target": {
            "type": receipt.target.type,
            "id": receipt.target.id,
        },
        "installed_version": receipt.installed_version,
        "snapshot_id": receipt.snapshot_id,
        "metadata": getattr(receipt, "metadata", {}),
    }
