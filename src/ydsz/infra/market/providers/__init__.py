"""Market provider registry — maps market types to their implementation.

Usage::

    from ydsz.infra.market.providers import get_provider, register_provider

    provider = get_provider("skills")   # → SkillsProvider instance
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from ydsz.infra.market.constants import MARKET_ITEM_TYPES
from ydsz.infra.market.errors import MarketError, MarketErrorCode

if TYPE_CHECKING:
    from ydsz.infra.market.providers.base import MarketProvider

# Provider instances are created lazily to avoid circular imports at module load.
_provider_factories: dict[str, type[MarketProvider]] = {}
_provider_instances: dict[str, MarketProvider] = {}


def register_provider(type: str, factory: type[MarketProvider]) -> None:
    """Register a provider factory for a market type.

    Called once per provider at module-import time (see individual provider
    ``__init__`` bottom-of-file ``register_provider(...)`` calls).
    """
    _provider_factories[type] = factory
    # Evict any stale cached instance if re-registering.
    _provider_instances.pop(type, None)


def get_provider(type: str) -> MarketProvider:
    """Return (creating if needed) the provider for the given type."""
    if type not in MARKET_ITEM_TYPES:
        raise MarketError(
            MarketErrorCode.UNSUPPORTED_TYPE,
            f"unsupported market type: {type!r}",
        )
    inst = _provider_instances.get(type)
    if inst is not None:
        return inst
    factory = _provider_factories.get(type)
    if factory is None:
        raise MarketError(
            MarketErrorCode.UNSUPPORTED_TYPE,
            f"no provider registered for type: {type!r}",
        )
    inst = factory()
    _provider_instances[type] = inst
    return inst


def all_providers() -> dict[str, MarketProvider]:
    """Return providers for all known types (creating on first access)."""
    return {t: get_provider(t) for t in MARKET_ITEM_TYPES}


def reset_registry() -> None:
    """Clear cached provider instances — used by tests."""
    _provider_instances.clear()
    _provider_factories.clear()
