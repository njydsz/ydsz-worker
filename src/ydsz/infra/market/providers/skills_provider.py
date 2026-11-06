"""Skill marketplace provider — SkillHub + local bundled packages.

``list_items``/``search`` read SkillHub over HTTP; ``detail`` enriches an entry
with download counts; ``install`` downloads the package, creates a local
:class:`SkillPackageStore` entry, and copies the requested skills into the
target agent's workspace.
"""

from __future__ import annotations

import asyncio
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
from ydsz.infra.skills.skill_transfer import copy_package_skills_to_workspace

logger = logging.getLogger(__name__)

_SKILLHUB_HOST = "https://skillhub.ydsz.com"
_SKILL_HUB_SEARCH_ENDPOINT = "/api/skills/search"
_SKILLHUB_DETAIL_ENDPOINT = "/api/skills/detail"
_SKILLHUB_CATEGORIES_ENDPOINT = "/api/skills/categories"
_SKILLHUB_RANKINGS_ENDPOINT = "/api/skills/rankings"

_SORT_TO_RANKING = {"downloads": "downloads", "rating": "rating", "newest": "newest"}
_RANKING_TO_SORT = {v: k for k, v in _SORT_TO_RANKING.items()}

_MAX_PAGE_LIMIT = 50


class SkillsProvider(MarketProvider):
    @property
    def market_type(self) -> MarketItemType:
        return "skill"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "技能", "en": "Skills"}

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
        """Browse by ranking (downloads/rating/newest)."""
        ranking_key = _SORT_TO_RANKING.get(sort, "hot")
        raw = await _fetch_rankings(ranking_key, self._host(locale))
        items = list(raw.get("items", []))
        if category:
            items = [i for i in items if i.get("category") == category]
        total = len(items)
        page = items[offset : offset + limit]
        return MarketListResult(
            tuple(_skill_item(i, locale, db=kw.get("db")) for i in page),
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
        """Full-text search against SkillHub."""
        raw = await _search(query, self._host(locale), min(limit, _MAX_PAGE_LIMIT))
        items = list(raw.get("items", []))
        if category:
            items = [i for i in items if i.get("category") == category]
        total = len(items)
        page = items[offset : offset + limit]
        return MarketListResult(
            tuple(_skill_item(i, locale, db=kw.get("db")) for i in page),
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
        """Fetch full detail for one skill package (readme/changelog/deps)."""
        try:
            raw = await _detail(identity, self._host(locale))
        except Exception as exc:
            raise MarketError(
                MarketErrorCode.PROVIDER_UNAVAILABLE, f"SkillHub detail failed: {exc}"
            ) from exc

        item = _skill_item(raw, locale, db=db)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=raw.get("readme") or raw.get("description"),
            changelog=raw.get("changelog"),
            dependencies=tuple(raw.get("requires", ())),
            metadata={
                "category": raw.get("category", "other"),
                "slug": raw.get("slug", identity),
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
        """Download the SkillHub package and copy its skills into the workspace."""
        if not user or server is None:
            raise MarketError(
                MarketErrorCode.INVALID_TARGET,
                "skill install requires an authenticated user and a running server",
            )
        workspace = await _resolve_target_workspace(target, user, server)
        slugs = list(opts.get("skill_slugs") or []) or None

        # Download + persist as a local package, then copy into the workspace.
        files = await _download_package(identity, self._host(None))
        package_id = await asyncio.to_thread(_persist_package, files, identity, user, server)
        copied = await copy_package_skills_to_workspace(
            store=_package_store(server),
            package_id=package_id,
            slugs=slugs or [name for name, _ in files if name.endswith("SKILL.md")],
            workspace=workspace,
        )
        return InstallReceipt(
            market_item=_installed_item(identity, copied),
            target=target,
            installed_version=_package_version(files),
            logs=(
                f"package_id={package_id}",
                f"copied_skills={','.join(copied)}" if copied else "copied_skills=0",
            ),
        )

    # ── Config / host ──────────────────────────────────────────────────
    def _host(self, locale: str | None) -> str:
        """Resolve the SkillHub host (locale-specific in future)."""
        return _SKILLHUB_HOST

    # ── Category facets ─────────────────────────────────────────────────
    async def categories(self, *, locale: str | None = None, **kw: Any) -> list[dict[str, str]]:
        """Category facets with item counts, as the base contract requires."""
        try:
            raw = await _categories(self._host(locale))
        except Exception:
            return []
        facets: list[dict[str, str]] = []
        for item in raw.get("items", []):
            slug = str(item.get("category") or "")
            if not slug:
                continue
            label = _pick_localized(item.get("category_label") or slug, locale)
            existing = next((f for f in facets if f["slug"] == slug), None)
            if existing is None:
                facets.append({"slug": slug, "label": label, "count": "1"})
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
        """Local packages are not tracked in the install registry."""
        return []


# ── SkillHub HTTP helpers ──────────────────────────────────────────────────
async def _fetch_rankings(ranking_key: str, host: str) -> dict[str, Any]:
    from ydsz.infra.skills.skillhub_market import fetch_skillhub_rankings

    return await fetch_skillhub_rankings(ranking_key, host=host)


async def _search(query: str, host: str, limit: int) -> dict[str, Any]:
    from ydsz.infra.skills.skillhub_market import search_skillhub

    items = await search_skillhub(query, limit=limit, host=host)
    return {"items": list(items)}


async def _detail(slug: str, host: str) -> dict[str, Any]:
    """Fetch one package's detail via the search endpoint (single source)."""
    from ydsz.infra.skills.skillhub_market import search_skillhub

    for item in await search_skillhub(slug, limit=1, host=host):
        if str(item.get("slug") or "") == slug:
            return dict(item)
    raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, slug)


async def _categories(host: str) -> dict[str, Any]:
    """Raw ranked items; category facets are derived by the provider."""
    from ydsz.infra.skills.skillhub_market import fetch_skillhub_rankings

    return await fetch_skillhub_rankings("hot", host=host)


async def _download_package(slug: str, host: str) -> list[tuple[str, bytes]]:
    from ydsz.infra.skills.skillhub_market import download_skillhub_package

    return await download_skillhub_package(slug, host=host)


def _persist_package(
    files: list[tuple[str, bytes]],
    slug: str,
    user: Any,
    server: Any,
) -> str:
    """Create a local package row + skill files; returns the package id."""
    from ydsz.infra.skills.skill_package_store import SkillPackageStore

    store = SkillPackageStore(
        repo=server.services.repos.skill_package_repo,
        root=server.paths.skill_packages_dir,
    )
    row = store.create(
        name=str(slug),
        description="",
        created_by=str(getattr(user, "username", "") or getattr(user, "id", "")),
    )
    for name, content in files:
        if not name.endswith("SKILL.md"):
            continue
        skill_slug = name[: -len("/SKILL.md")] if "/" in name else slug
        store.write_skill(
            row.id,
            skill_slug,
            files=[(name, content)],
        )
    return row.id


def _package_store(server: Any) -> Any:
    from ydsz.infra.skills.skill_package_store import SkillPackageStore

    return SkillPackageStore(
        repo=server.services.repos.skill_package_repo,
        root=server.paths.skill_packages_dir,
    )


async def _resolve_target_workspace(target: InstallTarget, user: Any, server: Any) -> Any:
    """Resolve the harness workspace for the install target."""
    from ydsz.api.common.workspace import require_running_workspace

    return await require_running_workspace(
        target.id,
        user=user,
        as_user=getattr(user, "id", None),
        server=server,
    )


def _package_version(files: list[tuple[str, bytes]]) -> str:
    for name, content in files:
        if name.endswith("SKILL.md"):
            import re

            match = re.search(rb"^version:\s*(\S+)", content, re.MULTILINE)
            if match:
                return match.group(1).decode("utf-8", "replace")
    return "1.0.0"


def _installed_item(identity: str, copied: list[str]) -> MarketItem:
    return MarketItem(
        market_id=f"skill:{identity}",
        type="skill",
        source="skillhub",
        identity=identity,
        name=identity,
        description="",
        icon_url=None,
        icon_name="book",
        color=None,
        version="1.0.0",
        author=MarketAuthor(name="SkillHub"),
        category="other",
        tags=(),
        installed=True,
        installed_version="1.0.0",
        size_bytes=None,
        source_url=f"{_SKILLHUB_HOST}/skills/{identity}",
        updated_at=None,
    )


def _skill_item(
    raw: dict[str, Any],
    locale: str | None,
    *,
    db: Any = None,
) -> MarketItem:
    """Map a raw SkillHub entry to MarketItem."""
    from datetime import datetime

    slug = str(raw.get("slug") or raw.get("id") or "")
    raw_name = raw.get("name") or raw.get("display_name") or slug
    name = _pick_localized(raw_name, locale)
    raw_desc = raw.get("description") or raw.get("summary") or ""
    desc = _pick_localized(raw_desc, locale)
    version = str(raw.get("version") or "1.0.0")
    author_raw = raw.get("author")
    if isinstance(author_raw, dict):
        author_name = str(author_raw.get("name") or "SkillHub")
    else:
        author_name = str(author_raw or "SkillHub")
    updated_at = raw.get("updated_at")
    if isinstance(updated_at, (int, float)):
        updated_at = datetime.fromtimestamp(updated_at).isoformat()
    downloads = int(raw.get("downloads") or raw.get("download_count") or 0)
    installed, installed_version = _local_install_state(slug, db)
    return MarketItem(
        market_id=f"skill:{slug}",
        type="skill",
        source="skillhub",
        identity=slug,
        name=name,
        description=desc,
        icon_url=raw.get("icon") or None,
        icon_name=str(raw.get("icon_name") or "book"),
        color=raw.get("color") or None,
        version=version,
        author=MarketAuthor(name=author_name),
        category=str(raw.get("category") or "other"),
        tags=tuple(raw.get("tags") or ()),
        rating=float(raw.get("rating") or 0),
        downloads=downloads,
        installed=installed,
        installed_version=installed_version,
        has_update=installed and bool(installed_version and installed_version != version),
        size_bytes=int(raw.get("size_bytes") or 0) or None,
        source_url=f"{_SKILLHUB_HOST}/skills/{slug}",
        updated_at=str(updated_at) if updated_at else None,
    )


def _pick_localized(value: Any, locale: str | None) -> str:
    if isinstance(value, dict):
        loc = (locale or "zh").lower()
        for key in (loc, "zh", "en"):
            if value.get(key):
                return str(value[key])
        return str(next(iter(value.values()))) if value else ""
    return str(value or "")


def _local_install_state(slug: str, db: Any) -> tuple[bool, str | None]:
    """Look up whether this SkillHub package is installed locally."""
    if db is None:
        return False, None
    try:
        rows = db.fetchall(
            "SELECT package_id FROM skill_packages WHERE source_url LIKE ?",
            [f"%{slug}%"],
        )
    except Exception:
        return False, None
    if not rows:
        return False, None
    return True, str(rows[0].get("version") or "1.0.0") if rows[0] else "1.0.0"


register_provider("skill", SkillsProvider)
