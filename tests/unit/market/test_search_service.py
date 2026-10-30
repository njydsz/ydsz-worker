"""Tests for SearchService."""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from ydsz.infra.market.cache import SearchCache
from ydsz.infra.market.models import MarketItem, MarketListResult
from ydsz.infra.market.search import SearchService


def test_cache_make_key_deterministic() -> None:
    """Same params yield the same key."""
    k1 = SearchCache.make_key(
        query="gmail", types=("skill", "expert"),
        category=None, sort="relevance", locale="zh", page=0,
    )
    k2 = SearchCache.make_key(
        query="gmail", types=("skill", "expert"),
        category=None, sort="relevance", locale="zh", page=0,
    )
    assert k1 == k2
    assert len(k1) == 64  # sha256 hex


def test_cache_make_key_varies_with_input() -> None:
    """Different inputs yield different keys."""
    k1 = SearchCache.make_key(
        query="gmail", types=("skill",),
        category=None, sort="relevance", locale="zh", page=0,
    )
    k2 = SearchCache.make_key(
        query="gmail", types=("skill", "expert"),
        category=None, sort="relevance", locale="zh", page=0,
    )
    assert k1 != k2


@pytest.mark.asyncio
async def test_search_service_aggregates_and_sorts_by_downloads() -> None:
    """SearchService aggregates results and sorts by downloads desc."""
    svc = SearchService()

    item_low = MarketItem(
        market_id="skill:low", type="skill", source="ILTIN",
        identity="low", name="Low", downloads=10,
    )
    item_high = MarketItem(
        market_id="skill:high", type="skill", source="ILTIN",
        identity="high", name="High", downloads=9999,
    )

    with patch("ydsz.infra.market.search.get_provider") as gp:
        provider_mock = AsyncMock()
        provider_mock.search = AsyncMock(
            return_value=MarketListResult((item_high, item_low), 2, 10, 0, "downloads"),
        )
        gp.return_value = provider_mock

        result = await svc.search(
            "test", ["skill"],
            sort="downloads", limit=10, offset=0, locale="zh",
        )

    assert result["items"][0]["downloads"] == 9999
    assert result["items"][1]["downloads"] == 10
    assert result["total"] == 2
