"""Plugin marketplace provider — wraps the bundled plugin market.

Reads :meth:`PluginManager.list_market` (in-tree catalog today) and installs
via :meth:`PluginManager.install_from_market`.
"""

from __future__ import annotations

import logging
from typing import Any

from ydsz.infra.market.constants import MarketItemType, MarketSort
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.models import (
    InstallReceipt,
    InstallTarget,
    MarketAuthor,
    MarketDetail,
    MarketItem,
    MarketListResult,
)
from ydsz.infra.market.providers.base import MarketProvider
from ydsz.infra.market.providers.registry import register_provider

logger = logging.getLogger(__name__)


class PluginsProvider(MarketProvider):
    """Plugin marketplace — bundled market catalog."""

    @property
    def market_type(self) -> MarketItemType:
        return "plugin"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "插件", "en": "Plugins"}

    @property
    def default_sort(self) -> MarketSort:
        return "relevance"

    @property
    def supported_sorts(self) -> list[MarketSort]:
        return ["relevance"]

    # ── Browse / search ─────────────────────────────────────────────────
    async def list_items(
        self,
        *,
        category: str | None,
        sort: MarketSort,
        limit: int,
        offset: int,
        locale: str | None,
        **kw: Any,
    ) -> MarketListResult:
        entries = _scan(kw.get("server"))
        if category:
            entries = [e for e in entries if str(e.get("group") or "") == category]
        total = len(entries)
        page = entries[offset : offset + limit]
        return MarketListResult(
            tuple(_plugin_item(e, locale) for e in page),
            total,
            limit,
            offset,
            sort,
            category,
        )

    async def search(
        self,
        query: str,
        *,
        category: str | None,
        sort: MarketSort,
        limit: int,
        offset: int,
        locale: str | None,
        **kw: Any,
    ) -> MarketListResult:
        q = query.strip().lower()
        entries = [
            e
            for e in _scan(kw.get("server"))
            if q in str(e.get("name") or "").lower()
            or q in str(e.get("description") or "").lower()
            or q in str(e.get("id") or "").lower()
            or q in str(e.get("group") or "").lower()
        ]
        if category:
            entries = [e for e in entries if str(e.get("group") or "") == category]
        total = len(entries)
        page = entries[offset : offset + limit]
        return MarketListResult(
            tuple(_plugin_item(e, locale) for e in page),
            total,
            limit,
            offset,
            sort,
            category,
        )

    # ── Detail ──────────────────────────────────────────────────────────
    async def detail(
        self,
        identity: str,
        *,
        locale: str | None = None,
        db: Any = None,
        user: Any = None,
        server: Any = None,
        **kw: Any,
    ) -> MarketDetail:
        match = next((e for e in _scan(server) if str(e.get("id")) == identity), None)
        if match is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, f"plugin not found: {identity}")
        item = _plugin_item(match, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=str(match.get("description") or ""),
            changelog=None,
            dependencies=tuple(match.get("requires") or ()),
            metadata={
                "kind": match.get("kind"),
                "group": match.get("group"),
                "requires": tuple(match.get("requires") or ()),
            },
        )

    # ── Install ─────────────────────────────────────────────────────────
    async def install(
        self,
        identity: str,
        *,
        target: InstallTarget,
        user: Any,
        server: Any,
        **opts: Any,
    ) -> InstallReceipt:
        if server is None:
            raise MarketError(
                MarketErrorCode.INVALID_TARGET,
                "plugin install requires a running server",
            )
        manager = getattr(server, "plugin_manager", None)
        if manager is None:
            raise MarketError(
                MarketErrorCode.PROVIDER_UNAVAILABLE, "plugin manager is not available"
            )
        try:
            loaded = await _install(manager, identity)
        except MarketError:
            raise
        except Exception as exc:
            raise MarketError(
                MarketErrorCode.INSTALL_FAILED, f"plugin install failed: {exc}"
            ) from exc
        manifest = getattr(loaded, "manifest", None)
        plugin_id = str(getattr(manifest, "id", identity))
        version = str(getattr(manifest, "version", "1.0.0"))
        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"plugin:{plugin_id}",
                type="plugin",
                source="ILTIN",
                identity=plugin_id,
                name=str(getattr(manifest, "name", plugin_id)),
                installed=True,
                installed_version=version,
            ),
            target=target,
            installed_version=version,
            logs=(f"plugin_id={plugin_id}",),
        )

    # ── Category facets ─────────────────────────────────────────────────
    async def categories(self, *, locale: str | None = None, **kw: Any) -> list[dict[str, str]]:
        facets: list[dict[str, str]] = []
        for entry in _scan(kw.get("server")):
            slug = str(entry.get("group") or "")
            if not slug:
                continue
            existing = next((f for f in facets if f["slug"] == slug), None)
            if existing is None:
                facets.append({"slug": slug, "label": slug, "count": "1"})
            else:
                existing["count"] = str(int(existing["count"]) + 1)
        return facets

    async def installed_list(
        self,
        *,
        user_id: int,
        db: Any = None,
        **kw: Any,
    ) -> list[dict[str, Any]]:
        return []


def _scan(server: Any = None) -> list[dict[str, Any]]:
    """Read the plugin market catalog from the running server, if available."""
    manager = getattr(server, "plugin_manager", None) if server is not None else None
    if manager is None:
        return []
    try:
        return list(manager.list_market())
    except Exception as exc:  # noqa: BLE001
        logger.warning("plugin market scan failed: %s", exc)
        return []


async def _install(manager: Any, plugin_id: str) -> Any:
    import asyncio

    return await asyncio.to_thread(manager.install_from_market, plugin_id)


def _plugin_item(entry: dict[str, Any], locale: str | None) -> MarketItem:
    raw_name = entry.get("name") or entry.get("id") or ""
    name = (
        raw_name.get(locale or "zh", "")
        if isinstance(raw_name, dict)
        else str(raw_name or entry.get("id") or "")
    )
    raw_desc = entry.get("description") or ""
    desc = raw_desc.get(locale or "zh", "") if isinstance(raw_desc, dict) else str(raw_desc or "")
    installed = bool(entry.get("installed"))
    installed_version = entry.get("installed_version")
    version = str(entry.get("version") or "1.0.0")
    return MarketItem(
        market_id=f"plugin:{entry.get('id')}",
        type="plugin",
        source="ILTIN",
        identity=str(entry.get("id") or ""),
        name=name,
        description=desc,
        icon_url=entry.get("icon") or None,
        icon_name="puzzle",
        color=None,
        version=version,
        author=MarketAuthor(name="ILTIN"),
        category=str(entry.get("group") or "other"),
        tags=(),
        rating=0.0,
        downloads=0,
        installed=installed,
        installed_version=str(installed_version) if installed_version else None,
        has_update=bool(entry.get("update_available")),
        size_bytes=None,
        source_url=None,
        updated_at=None,
    )


register_provider("plugin", PluginsProvider)
