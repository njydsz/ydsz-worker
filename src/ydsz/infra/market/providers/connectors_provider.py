"""Connectors provider — wraps catalog + Live JSON endpoints."""

from __future__ import annotations

import logging
from typing import Any

from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.models import (
    InstallReceipt,
    MarketAuthor,
    MarketDetail,
    MarketItem,
    MarketListResult,
)
from ydsz.infra.market.providers.base import MarketProvider
from ydsz.infra.market.providers.registry import register_provider

logger = logging.getLogger(__name__)


def _localized(obj: Any, locale: str | None = None) -> str:
    """Extract a display string from a possibly-localized value."""
    if obj is None:
        return ""
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        loc = (locale or "zh").lower()
        for k in (loc, "zh", "en"):
            v = obj.get(k)
            if v:
                return str(v)
        return str(obj) or ""
    loc = (locale or "zh").lower()
    for attr in (loc, "zh", "en"):
        v = getattr(obj, attr, None)
        if v:
            return str(v)
    return ""


def _to_dict(entry: Any) -> dict[str, Any]:
    """Normalize a catalog entry (dict or dataclass) to a plain dict."""
    if isinstance(entry, dict):
        return entry
    return {
        "kind": getattr(entry, "kind", ""),
        "name": _localized(getattr(entry, "name", "")),
        "description": _localized(getattr(entry, "description", "")),
        "auth_kind": str(getattr(entry, "auth_kind", "")),
        "doc_url": getattr(entry, "doc_url", "") or "",
        "icon": getattr(entry, "icon", "") or "",
        "color": getattr(entry, "color", "") or "",
        "category": str(getattr(entry, "category", "")),
        "phase": str(getattr(entry, "phase", "available")),
        "mcp_mode": str(getattr(entry, "mcp_mode", "")),
        "quick_auth_url": getattr(entry, "quick_auth_url", None),
        "supports_quick_auth": bool(getattr(entry, "quick_auth_url", None)),
        "author": "ILTIN",
    }


class ConnectorsProvider(MarketProvider):
    @property
    def market_type(self) -> str:
        return "connector"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "连接器", "en": "Connectors"}

    @property
    def default_sort(self) -> str:
        return "relevance"

    @property
    def supported_sorts(self) -> list[str]:
        return ["relevance"]

    # ── helpers ─────────────────────────────────────────────────────────
    def _entries(self) -> list[dict[str, Any]]:
        try:
            from ydsz.infra.connectors import catalog as mod

            raw = mod.list_catalog()
        except Exception as exc:  # noqa: BLE001
            logger.warning("catalog load failed: %s", exc)
            return []
        return [_to_dict(e) for e in raw]

    def _page(
        self,
        entries: list[dict],
        *,
        category: str | None,
        sort: str,
        limit: int,
        offset: int,
        locale: str | None,
        query: str | None = None,
    ) -> MarketListResult:
        if category:
            entries = [e for e in entries if e.get("category") == category]
        if query:
            q = query.strip().lower()
            entries = [
                e
                for e in entries
                if q in str(e.get("name", "")).lower()
                or q in str(e.get("description", "")).lower()
                or q in str(e.get("kind", "")).lower()
            ]
        total = len(entries)
        items = tuple(_item_from_dict(e, locale) for e in entries[offset : offset + limit])
        return MarketListResult(items, total, limit, offset, sort, category)

    # ── interface ─────────────────────────────────────────────────────
    async def list_items(self, *, category, sort, limit, offset, locale, **kw):
        return self._page(
            self._entries(), category=category, sort=sort, limit=limit, offset=offset, locale=locale
        )

    async def search(self, query, *, category, sort, limit, offset, locale, **kw):
        return self._page(
            self._entries(),
            category=category,
            sort=sort,
            limit=limit,
            offset=offset,
            locale=locale,
            query=query,
        )

    async def detail(self, identity, *, locale=None, **kw):
        match = next((e for e in self._entries() if e.get("kind") == identity), None)
        if match is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, identity)
        item = _item_from_dict(match, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=match.get("user_doc") or match.get("guide_url"),
            changelog=match.get("changelog"),
            metadata={
                "auth_kind": match.get("auth_kind"),
                "mcp_mode": match.get("mcp_mode"),
                "phase": match.get("phase", "available"),
                "supports_quick_auth": match.get("supports_quick_auth"),
                "quick_auth_url": match.get("quick_auth_url"),
            },
        )

    async def install(self, identity, *, target, user_id, **opts):
        if not opts.get("credentials"):
            raise MarketError(
                MarketErrorCode.INVALID_TARGET, "connector install requires credentials"
            )
        from ydsz.infra.connectors.builder import build_connector_instance

        inst = await build_connector_instance(
            kind=identity,
            display_name=opts.get("instance_name", identity),
            credentials=opts["credentials"],
            auth_kind=opts.get("auth_kind"),
            user_id=user_id,
        )
        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"connector:{identity}",
                type="connector",
                source="ILTIN",
                identity=identity,
                name=identity,
                installed=True,
                installed_version="1.0.0",
            ),
            target=target,
            installed_version="1.0.0",
            metadata={"instance_id": inst.get("id")},
        )


def _item_from_dict(e: dict[str, Any], locale: str | None) -> MarketItem:
    return MarketItem(
        market_id=f"connector:{e.get('kind', '')}",
        type="connector",
        source="ILTIN",
        identity=e.get("kind", ""),
        name=str(e.get("name") or ""),
        description=str(e.get("description") or ""),
        icon_url=e.get("icon") or None,
        icon_name="plug",
        color=e.get("color") or None,
        version="1.0.0",
        author=MarketAuthor(name=e.get("author", "ILTIN")),
        category=e.get("category", "other"),
        tags=tuple(t for t in [e.get("category")] if t),
        installed=False,
        source_url=e.get("doc_url") or None,
    )


register_provider("connector", ConnectorsProvider)
