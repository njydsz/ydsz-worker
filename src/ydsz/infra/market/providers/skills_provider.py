"""Skills provider — wraps :mod:`ydsz.infra.skills.skillhub_market`.

Bridges the Tencent SkillHub marketplace + ClawHub / GitHub imports into the
uniform ``MarketProvider`` interface.
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
    UpdateInfo,
)
from ydsz.infra.market.providers import register_provider
from ydsz.infra.market.providers.base import MarketProvider

logger = logging.getLogger(__name__)


# ── Sort key mapping ───────────────────────────────────────────────────────
_SORT_TO_RANKING: dict[str, str] = {
    "downloads": "hot",
    "newest": "newest",
    "rating": "recommended",
    "relevance": "trending",
}


class SkillsProvider(MarketProvider):
    """Read from Tencent SkillHub + local skill_packages table."""

    @property
    def market_type(self) -> str:
        return "skill"

    @property
    def display_name(self) -> dict[str, str]:
        return {"zh": "技能", "en": "Skills"}

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
        try:
            from ydsz.infra.skills.skillhub_market import (
                SkillHubMarketError,
                fetch_skillhub_rankings,
            )
        except ImportError:
            return MarketListResult((), 0, limit, offset, sort)

        ranking_key = _SORT_TO_RANKING.get(sort, "hot")
        try:
            raw = fetch_skillhub_rankings(
                ranking_key=ranking_key,
                limit=limit,
                offset=offset,
            )
        except SkillHubMarketError as exc:
            logger.warning("SkillHub list failed: %s", exc)
            return MarketListResult((), 0, limit, offset, sort)

        items = tuple(_raw_to_item(r, locale) for r in raw)
        if category:
            items = tuple(i for i in items if i.category == category)
        return MarketListResult(items, len(items), limit, offset, sort, category)

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
        try:
            from ydsz.infra.skills.skillhub_market import (
                SkillHubMarketError,
                search_skillhub,
            )
        except ImportError:
            return MarketListResult((), 0, limit, offset, sort)

        try:
            raw = search_skillhub(query, limit=limit, offset=offset)
        except SkillHubMarketError as exc:
            logger.warning("SkillHub search failed: %s", exc)
            return MarketListResult((), 0, limit, offset, sort)

        items = tuple(_raw_to_item(r, locale) for r in raw)
        if category:
            items = tuple(i for i in items if i.category == category)
        return MarketListResult(items, len(items), limit, offset, sort, category)

    async def detail(self, identity: str, *, locale: str | None = None, **kw: Any) -> MarketDetail:
        try:
            from ydsz.infra.skills.skillhub_market import (
                SkillHubMarketError,
                fetch_skillhub_detail,
            )
        except ImportError:
            raise MarketError(
                MarketErrorCode.ITEM_NOT_FOUND,
                "skills extra not installed",
            ) from None
        try:
            raw = fetch_skillhub_detail(identity)
        except SkillHubMarketError as exc:
            raise MarketError(MarketErrorCode.ITEM_NOT_FOUND, str(exc)) from exc

        item = _raw_to_item(raw, locale)
        meta = item.__dict__.copy()
        return MarketDetail(
            **meta,
            readme=raw.get("readme"),
            changelog=raw.get("changelog"),
            dependencies=tuple(raw.get("dependencies", ())),
            metadata={
                "slug": identity,
                "package_type": raw.get("package_type", "workspace"),
                "skill_count": raw.get("skill_count", 1),
                "platform": raw.get("platform", "cloud"),
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
        from ydsz.infra.skills.skillhub_market import (
            SkillHubMarketError,
            download_skillhub_package,
        )

        try:
            pkg_path = download_skillhub_package(identity)
        except SkillHubMarketError as exc:
            raise MarketError(MarketErrorCode.DOWNLOAD_FAILED, str(exc)) from exc

        version = "0.0.0"
        if target.type == "agent":
            from ydsz.infra.skills.skill_transfer import install_package_to_workspace
            install_package_to_workspace(pkg_path, target.id, user_id=user_id)
        elif target.type == "package":
            from ydsz.infra.skills.skill_package_store import SkillPackageStore
            store = SkillPackageStore()
            version = store.ingest(pkg_path, created_by=str(user_id))
        else:
            raise MarketError(
                MarketErrorCode.INVALID_TARGET,
                f"skills cannot install to target type {target.type}",
            )

        return InstallReceipt(
            market_item=MarketItem(
                market_id=f"skill:{identity}",
                type="skill",
                source=MarketSource["ILTIN"],
                identity=identity,
                name=identity,
                installed=True,
                installed_version=version,
            ),
            target=target,
            installed_version=version,
        )

    # ── Updates ─────────────────────────────────────────────────────────
    async def check_update(
        self,
        *,
        installed_version: str,
        identity: str,
        source: str | None = None,
        **kw: Any,
    ) -> UpdateInfo | None:
        try:
            from ydsz.infra.skills.skillhub_market import fetch_skillhub_detail
            raw = fetch_skillhub_detail(identity)
        except Exception:
            return None
        latest = raw.get("version", "")
        if latest and latest != installed_version:
            return UpdateInfo(
                market_id=f"skill:{identity}",
                installed_version=installed_version,
                latest_version=latest,
                changelog=raw.get("changelog"),
            )
        return None


# ── Helpers ────────────────────────────────────────────────────────────────
def _raw_to_item(raw: dict[str, Any], locale: str | None = None) -> MarketItem:
    """Convert a SkillHub API dict into a MarketItem."""
    slug = raw.get("slug") or raw.get("id", "")
    raw_name = raw.get("name", "")
    name = raw_name.get(locale or "zh", "") if isinstance(raw_name, dict) else (raw_name or slug)
    raw_desc = raw.get("description", raw.get("summary", ""))
    description = raw_desc.get(locale or "zh", "") if isinstance(raw_desc, dict) else (raw_desc or "")
    raw_author = raw.get("author")

    return MarketItem(
        market_id=f"skill:{slug}",
        type="skill",
        source=MarketSource["ILTIN"],
        identity=slug,
        name=name,
        description=description,
        icon_url=raw.get("icon_url"),
        icon_name=raw.get("icon_name", "package"),
        version=raw.get("version", ""),
        author=MarketAuthor(
            name=raw_author.get("name", ""),
            url=raw_author.get("url"),
        ) if raw_author else None,
        category=raw.get("category", "other"),
        tags=tuple(raw.get("tags", ())),
        rating=raw.get("rating"),
        downloads=raw.get("download_count", 0),
        source_url=f"https://skillhub.qoder.com/packages/{slug}",
        updated_at=raw.get("updated_at"),
    )


# ── Register ──────────────────────────────────────────────────────────────
register_provider("skill", SkillsProvider)
