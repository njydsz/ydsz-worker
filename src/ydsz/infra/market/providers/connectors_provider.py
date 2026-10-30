"""Connectors provider — wraps :mod:`ydsz.infra.connectors.catalog`.

Reads the bundled ``catalog.json`` presets, enriches with installation
state from the connector_instances table.
"""

from __future__ import annotations

import logging
from typing import Any

from ydsz.infra.market.constants import MarketSource
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.models import (
    InstallReceipt,
    InstallTarget,
    MarketAuthor,
    MarketDetail,
    MarketItem,
    MarketListResult,
)
from ydsz.infra.market.providers import register_provider
from ydsz.infra.market.providers.base import MarketProvider

logger = logging.getLogger(__name__)


class ConnectorsProvider(MarketProvider):
    """Connector catalog marketplace."""

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
        # connectors 没有真正的评分/下载量排序，退化为 by-name
        return ["relevance"]

    # ── Browse / search ───────────────────────────────────────────────────
    async def list_items(
        self,
        *,
        category: str | None,
        sort: str,
        limit: int,
        offset: int,
        locale: str | None,
    ) -> MarketListResult:
        all_entries = self._list_catalog()
        if category:
            all_entries = [e for e in all_entries if e.get("category") == category]
        total = len(all_entries)
        page = all_entries[offset:offset + limit]
        items = tuple(_entry_to_item(e, locale) for e in page)
        return MarketListResult(items, total, limit, offset, sort, category)

    async def search(
        self,
        query: str,
        *,
        category: str | None,
        sort: str,
        limit: int,
        offset: int,
        locale: str | None,
    ) -> MarketListResult:
        all_entries = self._list_catalog()
        q = query.strip().lower()
        if q:
            all_entries = [
                e for e in all_entries
                if q in e.get("name", "").lower()
                or q in e.get("description", "").lower()
                or q in e.get("kind", "").lower()
            ]
        if category:
            all_entries = [e for e in all_entries if e.get("category") == category]
        total = len(all_entries)
        page = all_entries[offset:offset + limit]
        items = tuple(_entry_to_item(e, locale) for e in page)
        return MarketListResult(items, total, limit, offset, sort, category)

    async def detail(self, identity: str, *, locale: str | None = None, **kw: Any) -> MarketDetail:
        all_entries = self._list_catalog()
        match = next((e for e in all_entries if e.get("kind") == identity), None)
        if match is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, identity)
        item = _entry_to_item(match, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=match.get("user_doc") or match.get("guide_url"),
            changelog=match.get("changelog"),
            metadata={
                "auth_kind": match.get("auth_kind"),
                "mcp_mode": match.get("mcp_mode"),
                "phase": match.get("phase", "available"),
                "supports_quick_auth": match.get("supports_quick_auth", False),
                "oauth_mode": match.get("oauth_mode"),
                "credential_fields": match.get("credential_fields", []),
                "quick_auth_url": match.get("quick_auth_url"),
            },
        )

    # ── Install ──────────────────────────────────────────────────────────
    async def install(
        self,
        identity: str,
        *,
        target: InstallTarget,
        user_id: int,
        **opts: Any,
    ) -> InstallReceipt:
        if not opts.get("credentials"):
            raise MarketError(
                MarketErrorCode.INVALID_TARGET,
                "connector install requires credentials ( authorize )",
            )
        from ydsz.infra.connectors.builder import build_connector_instance
        instance = await build_connector_instance(
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
                source=MarketSource["ILTIN"],
                identity=identity,
                name=identity,
                installed=True,
                installed_version="1.0.0",
            ),
            target=target,
            installed_version="1.0.0",
            metadata={"instance_id": instance.get("id")},
        )

    # ── Catalog scan ──────────────────────────────────────────────────
    def _list_catalog(self) -> list[dict[str, Any]]:
        try:
            from ydsz.infra.connectors.catalog import list_catalog
            return [e if isinstance(e, dict) else e.__dict__ for e in list_catalog()]
        except ImportError:
            return []


# ── Catalog entry → MarketItem ────────────────────────────────────────────
def _entry_to_item(e: dict[str, Any], locale: str | None = None) -> MarketItem:
    raw_name = e.get("name", e.get("kind", ""))
    name = raw_name if isinstance(raw_name, str) else raw_name.get(locale or "zh", e.get("kind", ""))
    raw_desc = e.get("description", "")
    desc = raw_desc if isinstance(raw_desc, str) else raw_desc.get(locale or "zh", "")

    return MarketItem(
        market_id=f"connector:{e.get('kind', '')}",
        type="connector",
        source=MarketSource["ILTIN"],
        identity=e.get("kind", ""),
        name=name,
        description=desc,
        icon_url=e.get("icon"),
        icon_name="plug",
        color=e.get("color"),
        version="1.0.0",
        author=MarketAuthor(name=e.get("author", "ILTIN")),
        category=e.get("category", "other"),
        tags=tuple(e.get("tags", ())),
        installed=False,  # caller fills
        source_url=e.get("doc_url"),
        metadata={
            "auth_kind": e.get("auth_kind"),
            "mcp_mode": e.get("mcp_mode"),
            "phase": e.get("phase", "available"),
            "supports_quick_auth": e.get("supports_quick_auth"),
            "credential_fields": e.get("credential_fields"),
        },
    )


# ── Register ──────────────────────────────────────────────────────────────
register_provider("connector", ConnectorsProvider)
