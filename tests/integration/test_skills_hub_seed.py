"""Integration tests for the bundled-seed branch of the skill market routes.

The point of the seed is that it works with **no upstream at all**, so these
tests fail loudly if either remote marketplace is touched.
"""

from __future__ import annotations

from typing import Any

import pytest


@pytest.fixture
async def env(env_with_main_agent):
    yield env_with_main_agent


def _forbid_network(monkeypatch: pytest.MonkeyPatch) -> None:
    from ydsz.infra.skills import qoder_market, skillhub_market

    def boom(*_args: object, **_kwargs: object) -> None:
        raise AssertionError("the seed source must not reach any marketplace")

    monkeypatch.setattr(qoder_market, "search_qoder_skills", boom)
    monkeypatch.setattr(skillhub_market, "search_skillhub", boom)


async def test_seed_rankings_need_no_upstream(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _forbid_network(monkeypatch)

    c, _srv, auth, _aid = env
    r = await c.get("/api/skills/hub/rankings", headers=auth, params={"source": "seed"})

    assert r.status_code == 200
    sections = r.json()["rankings"]
    assert set(sections) == {"recommended", "trending", "hot", "newest"}
    assert len(sections["hot"]["skills"]) > 0


async def test_seed_search_need_no_upstream(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _forbid_network(monkeypatch)

    c, _srv, auth, _aid = env
    r = await c.get(
        "/api/skills/hub/search",
        headers=auth,
        params={"source": "seed", "q": ""},
    )

    assert r.status_code == 200
    body = r.json()
    # An empty query must mean "hottest head", not a literal "a" search.
    assert len(body) > 0
    assert body[0]["slug"]


async def test_seed_search_passes_the_query_through(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    _forbid_network(monkeypatch)
    from ydsz.infra.skills import seed_catalog

    sample = seed_catalog.search_seed_skills("", limit=1)[0]

    c, _srv, auth, _aid = env
    r = await c.get(
        "/api/skills/hub/search",
        headers=auth,
        params={"source": "seed", "q": sample["slug"]},
    )

    assert r.status_code == 200
    assert sample["slug"] in [row["slug"] for row in r.json()]


async def test_seed_install_rejects_a_slug_outside_the_snapshot(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from tests.support.auth import create_agent, seed_openai_provider

    c, _srv, auth, _main_aid = env
    await seed_openai_provider(c, auth)
    aid = await create_agent(c, auth)

    r = await c.post(
        f"/api/agents/{aid}/skills/hub/install",
        headers=auth,
        json={
            "skill_name": "not-a-seeded-skill",
            "enable": True,
            "source": "seed",
        },
    )

    assert r.status_code == 404
    assert "bundled catalog" in r.text


async def test_seed_install_downloads_from_qoder_for_a_listed_slug(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from tests.support.auth import create_agent, seed_openai_provider
    from ydsz.infra.skills import qoder_market, seed_catalog

    sample = seed_catalog.search_seed_skills("", limit=1)[0]
    seen: dict[str, str] = {}

    async def fake_download(
        skill_name: str,
        *,
        host: str | None = None,
        timeout: float = 30.0,
    ) -> list[tuple[str, bytes]]:
        seen["slug"] = skill_name
        return [
            (
                "SKILL.md",
                f"---\nname: {skill_name}\ndescription: seeded\n---\n\n# Body\n".encode(),
            )
        ]

    monkeypatch.setattr(qoder_market, "download_qoder_skill", fake_download)

    c, _srv, auth, _main_aid = env
    await seed_openai_provider(c, auth)
    aid = await create_agent(c, auth)

    r = await c.post(
        f"/api/agents/{aid}/skills/hub/install",
        headers=auth,
        json={"skill_name": sample["slug"], "enable": True, "source": "seed"},
    )

    assert r.status_code == 201, r.text
    assert seen["slug"] == sample["slug"]
