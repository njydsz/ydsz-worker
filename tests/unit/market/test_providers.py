"""Tests for market provider base + registry."""

from __future__ import annotations

import pytest

from ydsz.infra.market.constants import MARKET_ITEM_TYPES, MarketItemType
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.providers import (
    all_providers,
    get_provider,
    register_provider,
    reset_registry,
)
from ydsz.infra.market.providers.base import MarketProvider


def test_all_four_types_registered() -> None:
    """After importing provider modules, all four types should be available."""
    # Providers auto-register at module import time.
    providers = all_providers()
    assert set(providers.keys()) == set(MARKET_ITEM_TYPES)


def test_get_provider_returns_correct_type() -> None:
    """Each provider exposes the correct market_type."""
    p = get_provider("skill")
    assert p.market_type == "skill"
    assert p.display_name["en"] == "Skills"
    assert p.display_name["zh"] == "技能"


def test_get_provider_unsupported_raises() -> None:
    """Requesting an unsupported type raises MarketError."""
    with pytest.raises(MarketError) as ei:
        get_provider("nonexistent_type")
    assert ei.value.code == MarketErrorCode.UNSUPPORTED_TYPE


def test_register_custom_provider() -> None:
    """Registering a custom provider overrides the factory."""

    class FakeProvider(MarketProvider):
        @property
        def market_type(self) -> str:
            return "skill"

        async def list_items(self, **kw):
            from ydsz.infra.market.models import MarketListResult
            return MarketListResult((), 0, 20, 0, "relevance")

        async def search(self, *a, **kw):
            from ydsz.infra.market.models import MarketListResult
            return MarketListResult((), 0, 20, 0, "relevance")

        async def install(self, *a, **kw):
            from ydsz.infra.market.models import InstallReceipt, InstallTarget, MarketItem
            return InstallReceipt(
                market_item=MarketItem(market_id="skill:fake", type="skill", source="ILTIN", identity="fake", name="Fake"),
                target=InstallTarget(type="agent", id="a"),
                installed_version="1.0.0",
            )

    # Save + restore so we don't pollute other tests.
    from ydsz.infra.market.providers import _provider_factories, _provider_instances
    saved_factories = dict(_provider_factories)
    saved_instances = dict(_provider_instances)

    try:
        register_provider("skill", FakeProvider)
        p = get_provider("skill")
        assert isinstance(p, FakeProvider)
    finally:
        # Restore original factories.
        _provider_factories.clear()
        _provider_factories.update(saved_factories)
        _provider_instances.clear()
        _provider_instances.update(saved_instances)
