"""Tests for market data models."""

from __future__ import annotations

from ydsz.infra.market.models import InstallReceipt, InstallTarget, MarketAuthor, MarketDetail, MarketItem


def test_market_item_creation() -> None:
    item = MarketItem(
        market_id="skill:gmail-2",
        type="skill",
        source="ILTIN",
        identity="gmail-2",
        name="Gmail Manager",
        description="Manage Gmail",
        tags=("email", "google"),
        downloads=1200,
    )
    assert item.market_id == "skill:gmail-2"
    assert item.installed is False
    assert item.has_update is False


def test_market_detail_inherits_item() -> None:
    detail = MarketDetail(
        market_id="expert:slack-gpt",
        type="expert",
        source="skillhub",
        identity="slack-gpt",
        name="Slack Expert",
        readme="# Slack Expert\nA great expert",
    )
    assert detail.market_id == "expert:slack-gpt"
    assert detail.readme == "# Slack Expert\nA great expert"


def test_install_receipt() -> None:
    item = MarketItem(
        market_id="skill:foo",
        type="skill",
        source="ILTIN",
        identity="foo",
        name="Foo",
        installed=True,
        installed_version="1.0.0",
    )
    target = InstallTarget(type="agent", id="agent-1")
    receipt = InstallReceipt(
        market_item=item,
        target=target,
        installed_version="1.0.0",
    )
    assert receipt.market_item.identity == "foo"
    assert receipt.target.id == "agent-1"
