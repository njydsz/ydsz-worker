"""Market-wide constants — types, sources, sort orders, limits."""

from __future__ import annotations

from typing import Literal

# ── Market item types ──────────────────────────────────────────────────────
MarketItemType = Literal["skill", "expert", "plugin", "connector"]

MARKET_ITEM_TYPES: tuple[MarketItemType, ...] = ("skill", "expert", "plugin", "connector")

# ── Capability sources ─────────────────────────────────────────────────────
MarketSource = Literal["ILTIN", "skillhub", "clawhub", "github", "community", "local"]

MARKET_SOURCES: tuple[MarketSource, ...] = (
    "ILTIN",
    "skillhub",
    "clawhub",
    "github",
    "community",
    "local",
)

# ── Sort orders ────────────────────────────────────────────────────────────
MarketSort = Literal["relevance", "downloads", "rating", "newest"]

MARKET_SORTS: tuple[MarketSort, ...] = ("relevance", "downloads", "rating", "newest")

# ── Install target types ───────────────────────────────────────────────────
InstallTargetType = Literal["agent", "package", "plugin_dir", "connector_instance"]

# ── Default pagination ────────────────────────────────────────────────────
DEFAULT_LIMIT = 20
MAX_LIMIT = 100

# ── Cache TTLs (seconds) ──────────────────────────────────────────────────
DEFAULT_SEARCH_CACHE_TTL = 300  # 5 min
DEFAULT_LIST_CACHE_TTL = 600  # 10 min

# ── Numeric safety ─────────────────────────────────────────────────────────
HOT_DOWNLOAD_THRESHOLD = 10  # min downloads for "hot" badge

# ── Metadata JSON keys (convention, not enforcement) ──────────────────────
# Skills:     slug, package_type, skill_count, platform
# Experts:    scene, sub_scene, skill_slugs, quick_prompts, task_examples
# Plugins:    kind, group, requires, tools
# Connectors: auth_kind, mcp_mode, phase, supports_quick_auth, oauth_mode,
#              credential_fields, quick_auth_url
