"""MarketProvider abstract base.

Each capability type (skills / experts / plugins / connectors) implements
this protocol.  The provider knows how to talk to one upstream source;
MarketManager aggregates across providers.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import TYPE_CHECKING, Any

from ydsz.infra.market.constants import (
    MARKET_SORTS,
    MarketItemType,
    MarketSort,
)
from ydsz.infra.market.models import (
    InstallReceipt,
    InstallTarget,
    MarketDetail,
    MarketListResult,
    UpdateInfo,
)

if TYPE_CHECKING:
    from ydsz.infra.db.pool import DatabasePool


class MarketProvider(ABC):
    """One market type's upstream gateway."""

    # ── Identity ─────────────────────────────────────────────────────────
    @property
    @abstractmethod
    def market_type(self) -> MarketItemType:
        """e.g. ``"skill"``."""

    @property
    def display_name(self) -> dict[str, str]:
        """Localized tab label."""
        return {"zh": self.market_type, "en": self.market_type}

    # ── Sorting / filtering ───────────────────────────────────────────────
    @property
    def default_sort(self) -> MarketSort:
        return "relevance"

    @property
    def supported_sorts(self) -> list[MarketSort]:
        return list(MARKET_SORTS)

    # ── Browse / search ───────────────────────────────────────────────────
    @abstractmethod
    async def list_items(
        self,
        *,
        category: str | None,
        sort: MarketSort,
        limit: int,
        offset: int,
        locale: str | None,
    ) -> MarketListResult:
        """Paginated browse with optional category filter."""

    @abstractmethod
    async def search(
        self,
        query: str,
        *,
        category: str | None,
        sort: MarketSort,
        limit: int,
        offset: int,
        locale: str | None,
    ) -> MarketListResult:
        """Full-text search — same return shape as ``list_items``."""

    async def detail(
        self,
        identity: str,
        *,
        locale: str | None = None,
        db: DatabasePool | None = None,
    ) -> MarketDetail:
        """Detail for the drawer. Default raises NotImplementedError.

        Subclasses MUST override to provide rich drawer content.
        """
        raise NotImplementedError(
            f"detail() not implemented for {self.market_type}"
        )

    # ── Install ──────────────────────────────────────────────────────────
    @abstractmethod
    async def install(
        self,
        identity: str,
        *,
        target: InstallTarget,
        user_id: int,
        **opts: Any,
    ) -> InstallReceipt:
        """Install one capability to the given target."""

    async def validate_target(self, target: InstallTarget) -> bool:
        """Pre-install hook — return False to reject."""
        return True

    # ── Installed / updates ─────────────────────────────────────────────
    async def installed_list(
        self,
        *,
        user_id: int,
        limit: int = 20,
        offset: int = 0,
        db: DatabasePool | None = None,
    ) -> list[dict[str, Any]]:
        """Return raw dicts describing what *this user* has installed for this type.

        Default implementation returns empty — subclasses override when the
        upstream source tracks installation state.
        """
        return []

    async def check_update(
        self,
        *,
        installed_version: str,
        identity: str,
        source: str | None = None,
        db: DatabasePool | None = None,
    ) -> UpdateInfo | None:
        """Return :class:`UpdateInfo` if a newer version exists, else None."""
        return None

    # ── Categories ─────────────────────────────────────────────────────
    async def categories(self) -> list[dict[str, str]]:
        """Return ``[{"slug": ..., "label": ..., "count": ...}]`` facets."""
        return []
