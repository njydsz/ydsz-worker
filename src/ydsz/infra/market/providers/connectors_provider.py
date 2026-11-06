"""Connector marketplace provider — wraps the built-in connector catalog.

``list_items``/``search``/``detail`` read :mod:`ydsz.infra.connectors.catalog`;
``install`` validates the submitted credentials and persists a connector
instance row for the user.
"""

from __future__ import annotations

import logging
from typing import Any

from ydsz.infra.connectors.builder import mcp_server_name, validate_create_credentials
from ydsz.infra.connectors.catalog import (
    ConnectorCatalogEntry,
    get_catalog_entry,
    list_catalog,
)
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


class ConnectorsProvider(MarketProvider):
    @property
    def market_type(self) -> MarketItemType:
        return "connector"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "连接器", "en": "Connectors"}

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
        entries = _entries()
        if category:
            entries = [e for e in entries if str(e.category) == category]
        total = len(entries)
        page = entries[offset : offset + limit]
        return MarketListResult(
            tuple(_connector_item(e, locale) for e in page),
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
        entries = _entries()
        q = query.strip().lower()
        if q:
            entries = [
                e
                for e in entries
                if q in e.kind.lower()
                or q in e.name.resolve(locale or "en").lower()
                or q in e.description.resolve(locale or "en").lower()
            ]
        if category:
            entries = [e for e in entries if str(e.category) == category]
        total = len(entries)
        page = entries[offset : offset + limit]
        return MarketListResult(
            tuple(_connector_item(e, locale) for e in page),
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
        entry = get_catalog_entry(identity)
        if entry is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, identity)
        item = _connector_item(entry, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=entry.description.resolve(locale or "en"),
            changelog=None,
            dependencies=(),
            metadata={
                "auth_kind": str(entry.auth_kind),
                "mcp_mode": str(entry.mcp_mode),
                "phase": str(entry.phase),
                "supports_quick_auth": bool(entry.quick_auth_url),
                "quick_auth_url": entry.quick_auth_url,
                "guide_url": entry.guide_url,
                "login_url": entry.login_url,
                "manual_url": entry.manual_url,
                "credential_fields": tuple(
                    {
                        "key": f.key,
                        "label": f.label.resolve(locale or "en"),
                        "field_type": str(f.field_type),
                        "required": bool(f.required),
                        "secret": bool(f.secret),
                    }
                    for f in entry.credential_fields
                ),
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
        """Validate credentials and persist a connector instance row."""
        if not user or server is None:
            raise MarketError(
                MarketErrorCode.INVALID_TARGET,
                "connector install requires an authenticated user and a running server",
            )
        entry = get_catalog_entry(identity)
        if entry is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, identity)
        if str(entry.phase) != "available":
            raise MarketError(MarketErrorCode.VALIDATION_FAILED, f"{identity} is not available")
        credentials = dict(opts.get("credentials") or {})
        if not credentials:
            raise MarketError(
                MarketErrorCode.INVALID_TARGET, "connector install requires credentials"
            )
        try:
            validate_create_credentials(identity, credentials)
        except Exception as exc:
            raise MarketError(MarketErrorCode.VALIDATION_FAILED, str(exc)) from exc

        repo = server.services.repos.connector_repo
        display_name = str(opts.get("instance_name") or entry.name.resolve("zh"))
        if repo.name_exists(getattr(user, "id", 0), display_name):
            raise MarketError(
                MarketErrorCode.INSTALL_CONFLICT,
                f"a connector named {display_name!r} already exists",
            )
        from ydsz.infra.utils.ulid import new_ulid

        instance_id = new_ulid()
        repo.create(
            instance_id=instance_id,
            user_id=getattr(user, "id", 0),
            kind=identity,
            display_name=display_name,
            mcp_server_name=mcp_server_name(identity, instance_id),
            shared=bool(opts.get("shared")),
            config_json=None,
        )
        server.services.audit_repo.write(
            actor=str(getattr(user, "username", "") or getattr(user, "id", "")),
            action="connector.instance.create",
            target=instance_id,
            payload=identity,
        )
        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"connector:{identity}",
                type="connector",
                source="ILTIN",
                identity=identity,
                name=display_name,
                installed=True,
                installed_version="1.0.0",
                source_url=entry.doc_url or None,
            ),
            target=target,
            installed_version="1.0.0",
            logs=(f"instance_id={instance_id}",),
        )

    # ── Category facets ─────────────────────────────────────────────────
    async def categories(self, *, locale: str | None = None, **kw: Any) -> list[dict[str, str]]:
        facets: list[dict[str, str]] = []
        for entry in _entries():
            slug = str(entry.category)
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
        if db is None:
            return []
        try:
            rows = db.fetchall(
                "SELECT identity, installed_version FROM connector_instances "
                "WHERE user_id = ? AND deleted_at IS NULL",
                [user_id],
            )
        except Exception:
            return []
        return [dict(r) for r in rows]


def _entries() -> list[ConnectorCatalogEntry]:
    try:
        return list_catalog()
    except Exception as exc:  # noqa: BLE001
        logger.warning("connector catalog load failed: %s", exc)
        return []


def _connector_item(entry: ConnectorCatalogEntry, locale: str | None) -> MarketItem:
    loc = locale or "en"
    return MarketItem(
        market_id=f"connector:{entry.kind}",
        type="connector",
        source="ILTIN",
        identity=entry.kind,
        name=entry.name.resolve(loc),
        description=entry.description.resolve(loc),
        icon_url=entry.icon or None,
        icon_name="plug",
        color=entry.color or None,
        version="1.0.0",
        author=MarketAuthor(name="ILTIN"),
        category=str(entry.category),
        tags=(),
        rating=0.0,
        downloads=0,
        installed=False,
        installed_version=None,
        has_update=False,
        size_bytes=None,
        source_url=entry.doc_url or None,
        updated_at=None,
    )


register_provider("connector", ConnectorsProvider)
