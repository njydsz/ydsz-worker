"""Plugins provider — wraps bundled plugins + PluginManager.

Reads the ``agents/plugins/bundled/`` directory and the installed plugin store.
Supports install via copy-from-bundled or git-clone-from-URL.
"""

from __future__ import annotations

import logging
import shutil
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


class PluginsProvider(MarketProvider):
    """Plugin marketplace — bundled + git-installed."""

    @property
    def market_type(self) -> str:
        return "plugin"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "插件", "en": "Plugins"}

    @property
    def default_sort(self) -> str:
        return "relevance"

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
        all_plugins = self._scan_bundled()
        if category:
            all_plugins = [p for p in all_plugins if p.get("category") == category]
        total = len(all_plugins)
        page = all_plugins[offset:offset + limit]
        items = tuple(_plugin_dict_to_item(d, locale) for d in page)
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
        all_plugins = self._scan_bundled()
        q = query.strip().lower()
        if q:
            all_plugins = [
                p for p in all_plugins
                if q in p.get("name", "").lower()
                or q in p.get("description", "").lower()
                or q in p.get("id", "").lower()
                or q in p.get("group", "").lower()
            ]
        if category:
            all_plugins = [p for p in all_plugins if p.get("category") == category]
        total = len(all_plugins)
        page = all_plugins[offset:offset + limit]
        items = tuple(_plugin_dict_to_item(d, locale) for d in page)
        return MarketListResult(items, total, limit, offset, sort, category)

    async def detail(self, identity: str, *, locale: str | None = None, **kw: Any) -> MarketDetail:
        all_plugins = self._scan_bundled()
        match = next((p for p in all_plugins if p["id"] == identity), None)
        if match is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, f"plugin not found: {identity}")

        item = _plugin_dict_to_item(match, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=match.get("readme"),
            changelog=match.get("changelog"),
            dependencies=tuple(match.get("requires", ())),
            metadata={
                "kind": match.get("kind"),
                "group": match.get("group"),
                "requires": match.get("requires", []),
                "tools": match.get("tools", []),
                "path": match.get("path"),
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
        return await self._install_bundled(identity, target=target, user_id=user_id)

    async def _install_bundled(
        self, identity: str, *, target: InstallTarget, user_id: int,
    ) -> InstallReceipt:
        from ydsz.infra.agents.plugins.manager import bundled_plugin_dir
        src = bundled_plugin_dir(identity)
        if not src or not src.is_dir():
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, identity)

        from ydsz.infra.utils.paths import PathLayout
        layout = PathLayout()
        dest = layout.plugins_dir / identity
        if dest.exists():
            raise MarketError(
                MarketErrorCode.INSTALL_CONFLICT,
                f"plugin already installed at {dest}",
            )

        shutil.copytree(src, dest)
        logger.info("Plugin %s installed → %s", identity, dest)

        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"plugin:{identity}",
                type="plugin",
                source=MarketSource["ILTIN"],
                identity=identity,
                name=identity,
                installed=True,
                installed_version="1.0.0",
            ),
            target=target,
            installed_version="1.0.0",
            metadata={"path": str(dest)},
        )

    # ── Scan ──────────────────────────────────────────────────────────
    def _scan_bundled(self) -> list[dict[str, Any]]:
        """Scan bundled plugins directory. Cached at class level."""
        try:
            from ydsz.infra.agents.plugins.manager import bundled_plugins
            return list(bundled_plugins())
        except ImportError:
            return []


# ── Dict → MarketItem ────────────────────────────────────────────────────
def _plugin_dict_to_item(d: dict[str, Any], locale: str | None = None) -> MarketItem:
    raw_name = d.get("name", d.get("id", ""))
    name = raw_name.get(locale or "zh", "") if isinstance(raw_name, dict) else (raw_name or d.get("id", ""))
    raw_desc = d.get("description", "")
    desc = raw_desc.get(locale or "zh", "") if isinstance(raw_desc, dict) else (raw_desc or "")

    return MarketItem(
        market_id=f"plugin:{d['id']}",
        type="plugin",
        source=MarketSource["ILTIN"],
        identity=d["id"],
        name=name,
        description=desc,
        icon_url=d.get("icon"),
        icon_name="puzzle",
        color=d.get("color"),
        version=d.get("version", "1.0.0"),
        author=MarketAuthor(name=d.get("author", "ILTIN")),
        category=d.get("group", "other"),
        tags=tuple(d.get("tags", ())),
        installed=d.get("installed", False),
        installed_version=d.get("installed_version"),
        source_url=d.get("source_url"),
        metadata={
            "kind": d.get("kind"),
            "group": d.get("group"),
            "requires": d.get("requires", []),
            "tools": d.get("tools", []),
        },
    )


# ── Register ──────────────────────────────────────────────────────────────
register_provider("plugin", PluginsProvider)
