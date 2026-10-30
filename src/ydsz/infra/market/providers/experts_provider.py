"""Experts provider — wraps :mod:`ydsz.infra.agents.experts.skillhub_market`.

Bridges bundled expert templates + SkillHub Skillset marketplace + published
experts into the uniform ``MarketProvider`` interface.
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


class ExpertsProvider(MarketProvider):
    """Expert marketplace — bundled + SkillHub Skillset + published."""

    @property
    def market_type(self) -> str:
        return "expert"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "专家", "en": "Experts"}

    @property
    def default_sort(self) -> str:
        return "downloads"

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
        # Step 1: bundled experts.
        bundled = self._list_bundled(locale=locale)

        # Step 2: SkillHub Skillsets (with error tolerance).
        try:
            from ydsz.infra.agents.experts.skillhub_market import (
                SkillHubMarketError,
                browse_skillsets,
            )
            skillhub_items, _scenes = browse_skillsets(query="", scene=category or "")
            skillhub_market = tuple(_skillhub_to_item(s, locale) for s in skillhub_items)
        except SkillHubMarketError as exc:
            logger.warning("SkillHub expert list failed: %s", exc)
            skillhub_market = ()
        except ImportError:
            skillhub_market = ()

        # Step 3: published experts from DB.
        published = self._list_published(locale=locale)

        all_items = bundled + skillhub_market + published
        total = len(all_items)

        # Pagination.
        items = all_items[offset:offset + limit]
        return MarketListResult(tuple(items), total, limit, offset, sort, category)

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
        # Bundled experts — filter through catalog.py (sync, in-memory).
        bundled = self._list_bundled(query=query, locale=locale)

        # SkillHub search.
        try:
            from ydsz.infra.agents.experts.skillhub_market import (
                SkillHubMarketError,
                browse_skillsets,
            )
            skillhub_items, _ = browse_skillsets(query=query, scene=category or "")
            skillhub_market = tuple(_skillhub_to_item(s, locale) for s in skillhub_items)
        except SkillHubMarketError:
            skillhub_market = ()

        published = self._list_published(query=query, locale=locale)

        all_items = bundled + skillhub_market + published
        items = all_items[offset:offset + limit]
        return MarketListResult(tuple(items), len(all_items), limit, offset, sort, category)

    async def detail(self, identity: str, *, locale: str | None = None, **kw: Any) -> MarketDetail:
        # Detect identity prefix.
        if identity.startswith("skillhub-skillset-"):
            return self._detail_skillhub(identity, locale=locale)
        return self._detail_bundled(identity, locale=locale)

    def _detail_bundled(self, identity: str, *, locale: str | None) -> MarketDetail:
        from ydsz.infra.agents.experts.catalog import discover_seed_paths
        paths = discover_seed_paths()
        match = next((p for p in paths if p.stem == identity or p.name == identity), None)
        if match is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, f"expert not found: {identity}")

        from ydsz.infra.agents.experts.catalog import (
            build_create_spec_from_expert,
            preview_paths_from_expert_dir,
        )
        spec = build_create_spec_from_expert(match)
        files = preview_paths_from_expert_dir(match)

        return MarketDetail(
            market_id=f"expert:{identity}",
            type="expert",
            source=MarketSource["ILTIN"],
            identity=identity,
            name=spec.name,
            description=spec.description,
            metadata={"files": [str(f) for f in files]},
        )

    def _detail_skillhub(self, identity: str, *, locale: str | None) -> MarketDetail:
        from ydsz.infra.agents.experts.skillhub_market import (
            SkillHubMarketError,
            fetch_skillset,
        )
        slug = identity.removeprefix("skillhub-skillset-")
        try:
            skillset = fetch_skillset(slug)
        except SkillHubMarketError as exc:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, str(exc)) from exc

        item = _skillhub_to_item(skillset, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=skillset.content if hasattr(skillset, "content") else None,
            quick_prompts=tuple(
                {"title": p.get("title", ""), "prompt": p.get("prompt", "")}
                for p in (skillset.raw.get("quick_prompts", []) if hasattr(skillset, "raw") else [])
            ),
            metadata={
                "scene": getattr(skillset, "scene", ""),
                "sub_scene": getattr(skillset, "sub_scene", ""),
                "skill_slugs": list(getattr(skillset, "skill_slugs", ())),
                "skill_count": getattr(skillset, "skill_count", 0),
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
        # Expert install always creates a new agent.
        if identity.startswith("skillhub-skillset-"):
            return await self._install_skillhub(identity, target=target, user_id=user_id, **opts)
        return await self._install_bundled(identity, target=target, user_id=user_id, **opts)

    async def _install_bundled(
        self, identity: str, *, target: InstallTarget, user_id: int, **opts: Any,
    ) -> InstallReceipt:
        from ydsz.infra.agents.experts.catalog import (
            build_create_spec_from_expert,
            discover_seed_paths,
        )
        paths = discover_seed_paths()
        match = next((p for p in paths if p.stem == identity), None)
        if match is None:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, identity)
        spec = build_create_spec_from_expert(match)

        from ydsz.infra.agents.experts.market_creation import create_agent_from_expert_spec
        agent_id = await create_agent_from_expert_spec(spec, owner_id=user_id)

        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"expert:{identity}",
                type="expert",
                source=MarketSource["ILTIN"],
                identity=identity,
                name=spec.name,
                installed=True,
                installed_version="1.0.0",
            ),
            target=target,
            installed_version="1.0.0",
            metadata={"agent_id": agent_id},
        )

    async def _install_skillhub(
        self, identity: str, *, target: InstallTarget, user_id: int, **opts: Any,
    ) -> InstallReceipt:
        slug = identity.removeprefix("skillhub-skillset-")
        from ydsz.infra.agents.experts.market_creation import create_agent_from_skillhub_skillset
        name = opts.get("name") or slug
        description = opts.get("description") or ""
        agent_id = await create_agent_from_skillhub_skillset(
            slug, user_id=user_id, name=name, description=description,
        )
        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"expert:{identity}",
                type="expert",
                source="skillhub",
                identity=identity,
                name=name,
                installed=True,
                installed_version="1.0.0",
            ),
            target=target,
            installed_version="1.0.0",
            metadata={"agent_id": agent_id},
        )

    # ── Helpers ─────────────────────────────────────────────────────────
    def _list_bundled(self, *, query: str | None = None, locale: str | None = None) -> tuple[MarketItem, ...]:
        try:
            from ydsz.infra.agents.experts.catalog import (
                build_create_spec_from_expert,
                discover_seed_paths,
            )
            paths = discover_seed_paths()
        except ImportError:
            return ()

        items: list[MarketItem] = []
        for p in paths:
            spec = build_create_spec_from_expert(p)
            if query and query.lower() not in f"{spec.name} {spec.description}".lower():
                continue
            items.append(MarketItem(
                market_id=f"expert:{spec.identity}",
                type="expert",
                source=MarketSource["ILTIN"],
                identity=spec.identity,
                name=spec.name,
                description=spec.description,
                icon_url=getattr(spec, "icon_url", None),
                icon_name=getattr(spec, "icon_name", "bot"),
                color=getattr(spec, "color", None),
                author=MarketAuthor(name=getattr(spec, "author", "ILTIN")),
                installed=False,  # caller fills
            ))
        return tuple(items)

    def _list_published(self, *, query: str | None = None, locale: str | None = None) -> tuple[MarketItem, ...]:
        # Deferred — when published_experts table is queried by market manager.
        return ()


# ── SkillHub → MarketItem 转换 ────────────────────────────────────────────
def _skillhub_to_item(skillset: Any, locale: str | None = None) -> MarketItem:
    """Convert a ``SkillHubSkillset`` dataclass to :class:`MarketItem`."""
    slug = getattr(skillset, "slug", "")
    raw_name = getattr(skillset, "display_name", "")
    name = raw_name.get(locale or "zh", "") if isinstance(raw_name, dict) else (raw_name or slug)
    raw_desc = getattr(skillset, "summary", "")
    desc = raw_desc.get(locale or "zh", "") if isinstance(raw_desc, dict) else (raw_desc or "")

    return MarketItem(
        market_id=f"expert:{getattr(skillset, 'expert_id', slug)}",
        type="expert",
        source="skillhub",
        identity=slug,
        name=name,
        description=desc,
        icon_url=getattr(skillset, "icon_url", None),
        icon_name="bot",
        version="1.0.0",
        author=MarketAuthor(name="ILTIN"),
        category=getattr(skillset, "scene", "other"),
    )


# ── Register ──────────────────────────────────────────────────────────────
register_provider("expert", ExpertsProvider)
