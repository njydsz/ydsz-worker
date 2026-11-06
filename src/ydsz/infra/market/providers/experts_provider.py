"""Expert marketplace provider — SkillHub experts + local catalog.

``list_items``/``search`` read SkillHub over HTTP; ``detail`` enriches an entry
with the cached catalog manifest; ``install`` materialises the expert template
into the local catalog and creates a new agent from it.
"""

from __future__ import annotations

import logging
from typing import Any

from ydsz.infra.agents.experts.catalog import (
    build_create_spec_from_expert,
    resolve_expert_agent_name,
)
from ydsz.infra.agents.experts.skillhub_market import (
    SkillHubSkillset,
    browse_skillsets,
    fetch_skillset,
    install_skillset_template,
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
from ydsz.infra.utils.locale import resolve_user_locale

logger = logging.getLogger(__name__)

_SKILLHUB_HOST = "https://skillhub.ydsz.com"

_SORT_TO_RANKING = {"downloads": "downloads", "rating": "rating", "newest": "newest"}
_MAX_PAGE_LIMIT = 50


class ExpertsProvider(MarketProvider):
    @property
    def market_type(self) -> MarketItemType:
        return "expert"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "专家", "en": "Experts"}

    @property
    def default_sort(self) -> MarketSort:
        return "downloads"

    @property
    def supported_sorts(self) -> list[MarketSort]:
        return ["downloads", "rating", "newest"]

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
        page_items, _scenes = await _browse("", scene=category or "")
        total = len(page_items)
        page = page_items[offset : offset + limit]
        return MarketListResult(
            tuple(_expert_item(i, locale) for i in page),
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
        page_items, _scenes = await _browse(query, scene=category or "")
        total = len(page_items)
        page = page_items[offset : offset + limit]
        return MarketListResult(
            tuple(_expert_item(i, locale) for i in page),
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
        try:
            entry = await _fetch_skillset(identity)
        except Exception as exc:
            raise MarketError(
                MarketErrorCode.PROVIDER_UNAVAILABLE, f"SkillHub detail failed: {exc}"
            ) from exc
        item = _expert_item(entry, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=item.description,
            changelog=None,
            dependencies=entry.skill_slugs,
            metadata={
                "category": entry.scene or "other",
                "slug": entry.slug,
                "skill_slugs": entry.skill_slugs,
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
        """Install an expert template and create a new agent from it."""
        if not user or server is None:
            raise MarketError(
                MarketErrorCode.INVALID_TARGET,
                "expert install requires an authenticated user and a running server",
            )
        locale = resolve_user_locale(
            user_repo=server.services.user_repo,
            user_id=getattr(user, "id", 0),
        )
        item = await _materialize(identity, server)
        catalog = server.expert_catalog
        if catalog is None:
            raise MarketError(
                MarketErrorCode.PROVIDER_UNAVAILABLE, "expert catalog is not available"
            )
        catalog.refresh()
        expert = catalog.get(item.expert_id)
        if expert is None:
            raise MarketError(
                MarketErrorCode.ITEM_NOT_FOUND,
                f"expert template {item.expert_id!r} was not cached",
            )
        spec = build_create_spec_from_expert(
            expert_id=item.expert_id,
            expert=expert,
            user_id=getattr(user, "id", 0),
            name=str(opts.get("name") or identity),
            locale=locale,
        )
        row = await server.app_runtime.agent_registry.create(spec)
        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"expert:{identity}",
                type="expert",
                source="skillhub",
                identity=identity,
                name=spec.name,
                description=spec.description or "",
                installed=True,
                installed_version="1.0.0",
                source_url=f"{_SKILLHUB_HOST}/experts/{identity}",
            ),
            target=target,
            installed_version="1.0.0",
            logs=(f"agent_id={row.agent_id}",),
        )

    # ── Config / host ──────────────────────────────────────────────────
    def _host(self, locale: str | None) -> str:
        return _SKILLHUB_HOST

    # ── Category facets ─────────────────────────────────────────────────
    async def categories(self, *, locale: str | None = None, **kw: Any) -> list[dict[str, str]]:
        try:
            entries, _scenes = await _browse("")
        except Exception:
            return []
        facets: list[dict[str, str]] = []
        for entry in entries:
            slug = entry.scene.strip()
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


# ── SkillHub helpers ──────────────────────────────────────────────────
async def _browse(query: str, *, scene: str = "") -> tuple[list[SkillHubSkillset], list[str]]:
    """Filtered skillsets plus every scene label SkillHub currently exposes."""
    import asyncio

    return await asyncio.to_thread(browse_skillsets, query, scene=scene)


async def _fetch_skillset(slug: str) -> SkillHubSkillset:
    import asyncio

    return await asyncio.to_thread(fetch_skillset, slug)


async def _materialize(identity: str, server: Any) -> Any:
    """Download and cache the expert template; returns the SkillHub item."""
    import asyncio

    return await asyncio.to_thread(
        install_skillset_template,
        slug=identity,
        cache_root=server.paths.expert_market_dir,
    )


def _expert_item(entry: SkillHubSkillset, locale: str | None) -> MarketItem:
    """Map a SkillHub skillset to MarketItem."""
    expert_id = entry.expert_id
    name = (
        entry.display_name
        if (locale or "zh") == "zh"
        else (entry.display_name_en or entry.display_name)
    )
    desc = entry.summary if (locale or "zh") == "zh" else (entry.summary_en or entry.summary)
    return MarketItem(
        market_id=f"expert:{expert_id}",
        type="expert",
        source="skillhub",
        identity=expert_id,
        name=name or expert_id,
        description=desc,
        icon_url=entry.icon_url or None,
        icon_name="user",
        color=None,
        version="1.0.0",
        author=MarketAuthor(name="SkillHub"),
        category=entry.scene or "other",
        tags=(),
        rating=0.0,
        downloads=0,
        installed=False,
        installed_version=None,
        has_update=False,
        size_bytes=None,
        source_url=f"{_SKILLHUB_HOST}/experts/{entry.slug}",
        updated_at=None,
    )


def _pick_localized(value: Any, locale: str | None) -> str:
    if isinstance(value, dict):
        loc = (locale or "zh").lower()
        for key in (loc, "zh", "en"):
            if value.get(key):
                return str(value[key])
        return str(next(iter(value.values()))) if value else ""
    return str(value or "")


def _agent_name_for(item: Any, locale: str) -> str:
    """Deterministic display name for a materialised expert."""
    return resolve_expert_agent_name(item.expert, item.expert_id, locale=locale)


register_provider("expert", ExpertsProvider)
