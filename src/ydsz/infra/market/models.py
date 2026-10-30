"""Market data models — shared between providers, manager, and API layer.

These are lightweight dataclasses (not ORM). Each provider is responsible for
converting its domain-specific data into these uniform shapes.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from ydsz.infra.market.constants import (
    InstallTargetType,
    MarketItemType,
    MarketSort,
    MarketSource,
)


# ── Author ─────────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class MarketAuthor:
    name: str
    url: str | None = None


# ── Category facet ─────────────────────────────────────────────────────────
@dataclass(frozen=True)
class MarketCategory:
    slug: str
    label: str
    count: int = 0


# ── Core item (list view) ──────────────────────────────────────────────────
@dataclass(frozen=True)
class MarketItem:
    """One entry in a market list view.

    ``installed`` is resolved by the caller (InstallService cross-checks
    the market_install_registry) rather than by the provider — providers
    describe the *catalog*; installation state belongs to the install layer.
    """

    market_id: str                           # "{type}:{identity}" — global unique
    type: MarketItemType                     # skill | expert | plugin | connector
    source: MarketSource
    identity: str                            # provider-native id (slug/kind/...)
    name: str
    description: str = ""
    icon_url: str | None = None
    icon_name: str | None = None             # lucide icon fallback name
    color: str | None = None                 # hex or named color
    version: str = ""
    author: MarketAuthor | None = None
    category: str = ""
    tags: tuple[str, ...] = ()
    rating: float | None = None
    downloads: int = 0
    installed: bool = False
    installed_version: str | None = None
    has_update: bool = False
    size_bytes: int | None = None
    source_url: str | None = None
    updated_at: str | None = None


# ── Drawer detail (extends item) ────────────────────────────────────────────
@dataclass(frozen=True)
class MarketDetail(MarketItem):
    """Full detail for the right-side drawer."""

    readme: str | None = None
    screenshots: tuple[str, ...] = ()
    changelog: str | None = None
    dependencies: tuple[str, ...] = ()
    quick_prompts: tuple[dict[str, str], ...] = ()
    metadata: dict[str, Any] = field(default_factory=dict)


# ── List result ──────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class MarketListResult:
    items: tuple[MarketItem, ...]
    total: int
    limit: int
    offset: int
    sort: MarketSort
    category: str | None = None


# ── Aggregated (cross-type) search result ──────────────────────────────────
@dataclass(frozen=True)
class AggregatedSearchResult:
    items: tuple[MarketItem, ...]
    total: int
    per_type: dict[str, int]
    limit: int
    offset: int
    query: str = ""


# ── Install target ─────────────────────────────────────────────────────────
@dataclass(frozen=True)
class InstallTarget:
    """Where to install a capability."""

    type: InstallTargetType                  # agent | package | plugin_dir | connector_instance
    id: str                                  # agent_id, package_id, plugin_dir, instance_id


# ── Install receipt ────────────────────────────────────────────────────────
@dataclass(frozen=True)
class InstallReceipt:
    """Returned to the caller after a successful install."""

    market_item: MarketItem
    target: InstallTarget
    installed_version: str
    snapshot_id: str | None = None           # for rollback
    logs: tuple[str, ...] = ()


# ── Update info ─────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class UpdateInfo:
    """Describes an available update for an already-installed item."""

    market_id: str
    installed_version: str
    latest_version: str
    download_url: str | None = None
    changelog: str | None = None


# ── Cache entry ────────────────────────────────────────────────────────────
@dataclass(frozen=True)
class CachedSearch:
    """Serialised cached search result (store in market_search_cache.results_json)."""

    market_ids: tuple[str, ...] = ()         # full MarketItem JSON would be huge; store ids only
    total: int = 0
