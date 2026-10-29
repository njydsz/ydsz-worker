"""Tests for the bundled skill-market seed snapshot (offline catalogue)."""

from __future__ import annotations

import pytest

from ydsz.infra.skills import seed_catalog


def test_snapshot_loads_with_metadata() -> None:
    meta = seed_catalog.seed_metadata()

    assert meta["version"] == 1
    assert meta["origin"] == "qoder"
    assert meta["generated_at"]
    assert meta["count"] == seed_catalog.seed_count()
    assert seed_catalog.seed_count() >= 50


def test_entries_carry_the_fields_the_market_ui_renders() -> None:
    rows = seed_catalog.search_seed_skills("", limit=5)

    assert rows
    for row in rows:
        assert row["slug"]
        assert row["name"]
        assert isinstance(row["installs"], int)
        assert row["source"] == "qoder"


def test_empty_query_returns_the_install_sorted_head() -> None:
    rows = seed_catalog.search_seed_skills("", limit=10)

    installs = [row["installs"] for row in rows]
    assert installs == sorted(installs, reverse=True)


def test_search_finds_an_entry_that_exists_in_the_snapshot() -> None:
    sample = seed_catalog.search_seed_skills("", limit=1)[0]

    hits = seed_catalog.search_seed_skills(sample["slug"], limit=20)

    assert sample["slug"] in [row["slug"] for row in hits]


def test_multi_term_query_requires_every_term() -> None:
    """Terms must narrow the result set, not widen it."""
    sample = seed_catalog.search_seed_skills("", limit=1)[0]

    wide = seed_catalog.search_seed_skills(sample["slug"], limit=50)
    strict = seed_catalog.search_seed_skills(f"{sample['slug']} zzz-not-present", limit=50)

    assert len(wide) >= 1
    assert strict == []


def test_search_is_case_insensitive() -> None:
    sample = seed_catalog.search_seed_skills("", limit=1)[0]

    lower = seed_catalog.search_seed_skills(sample["slug"].lower(), limit=5)
    upper = seed_catalog.search_seed_skills(sample["slug"].upper(), limit=5)

    assert [row["slug"] for row in lower] == [row["slug"] for row in upper]


def test_rankings_expose_the_four_dashboard_sections() -> None:
    payload = seed_catalog.seed_rankings("all", limit=3)

    assert set(payload["rankings"]) == {"recommended", "trending", "hot", "newest"}
    for section in payload["rankings"].values():
        assert section["total"] == seed_catalog.seed_count()
        assert len(section["skills"]) == 3


def test_newest_section_differs_from_hot() -> None:
    hot = seed_catalog.seed_rankings("hot", limit=5)["skills"]
    newest = seed_catalog.seed_rankings("newest", limit=5)["skills"]

    assert [row["slug"] for row in hot] != [row["slug"] for row in newest]


def test_get_seed_skill_resolves_a_listed_slug_and_rejects_others() -> None:
    sample = seed_catalog.search_seed_skills("", limit=1)[0]

    assert seed_catalog.get_seed_skill(sample["slug"]) is not None
    assert seed_catalog.get_seed_skill("definitely-not-in-the-snapshot") is None


def test_seed_catalog_error_is_raised_for_a_malformed_snapshot(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """:func:`_load` is cached, so clear it to observe the failure path."""

    class _Broken:
        def joinpath(self, _name: str) -> _Broken:
            return self

        def read_text(self, encoding: str) -> str:
            return "{not json"

    monkeypatch.setattr(seed_catalog.resources, "files", lambda _pkg: _Broken())
    seed_catalog._load.cache_clear()
    try:
        with pytest.raises(seed_catalog.SeedCatalogError, match="not valid JSON"):
            seed_catalog.seed_count()
    finally:
        seed_catalog._load.cache_clear()
