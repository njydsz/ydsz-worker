"""Integration tests for the Qoder marketplace branch of the skill hub routes."""

from __future__ import annotations

from typing import Any

import pytest


@pytest.fixture
async def env(env_with_main_agent):
    yield env_with_main_agent


async def test_global_search_routes_to_qoder(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """``source=qoder`` must hit the Qoder client, not SkillHub."""
    from ydsz.infra.skills import qoder_market, skillhub_market

    seen: dict[str, Any] = {}

    async def fake_qoder_search(
        query: str,
        *,
        limit: int = 50,
        page: int = 1,
        category: str = "",
        host: str | None = None,
        timeout: float = 10.0,
    ) -> list[dict[str, Any]]:
        seen["query"] = query
        seen["limit"] = limit
        return [{"slug": "pdf-extractor", "name": "PDF 提取器", "source": "qoder"}]

    def unexpected_skillhub(*_args: object, **_kwargs: object) -> None:
        raise AssertionError("SkillHub must not be called when source=qoder")

    monkeypatch.setattr(qoder_market, "search_qoder_skills", fake_qoder_search)
    monkeypatch.setattr(skillhub_market, "search_skillhub", unexpected_skillhub)

    c, _srv, auth, _aid = env
    r = await c.get("/api/skills/hub/search", headers=auth, params={"q": "pdf", "source": "qoder"})

    assert r.status_code == 200
    assert seen == {"query": "pdf", "limit": 50}
    assert r.json()[0]["slug"] == "pdf-extractor"


async def test_global_rankings_routes_to_qoder(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from ydsz.infra.skills import qoder_market

    seen: dict[str, Any] = {}

    async def fake_rankings(
        ranking_type: str = "all",
        *,
        limit: int = 50,
        host: str | None = None,
        timeout: float = 10.0,
    ) -> dict[str, Any]:
        seen["type"] = ranking_type
        return {"rankings": {"hot": {"section": "hot", "skills": [], "total": 3}}}

    monkeypatch.setattr(qoder_market, "fetch_qoder_rankings", fake_rankings)

    c, _srv, auth, _aid = env
    r = await c.get("/api/skills/hub/rankings", headers=auth, params={"source": "qoder"})

    assert r.status_code == 200
    assert seen["type"] == "all"
    assert "hot" in r.json()["rankings"]


async def test_unknown_source_falls_back_to_skillhub(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    from ydsz.infra.skills import qoder_market, skillhub_market

    async def fake_skillhub_search(
        query: str,
        *,
        limit: int = 50,
        host: str | None = None,
        timeout: float = 10.0,
    ) -> list[dict[str, Any]]:
        return [{"slug": "from-skillhub", "name": "SkillHub 结果"}]

    def unexpected_qoder(*_args: object, **_kwargs: object) -> None:
        raise AssertionError("Qoder must not be called for an unknown source")

    monkeypatch.setattr(skillhub_market, "search_skillhub", fake_skillhub_search)
    monkeypatch.setattr(qoder_market, "search_qoder_skills", unexpected_qoder)

    c, _srv, auth, _aid = env
    r = await c.get(
        "/api/skills/hub/search",
        headers=auth,
        params={"q": "x", "source": "bogus"},
    )

    assert r.status_code == 200
    assert r.json()[0]["slug"] == "from-skillhub"


async def test_install_from_qoder_writes_the_skill(
    env: Any,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """End-to-end: install a Qoder skill and confirm it lands in the workspace."""
    from tests.support.auth import create_agent, seed_openai_provider
    from ydsz.infra.skills import qoder_market

    async def fake_download(
        skill_name: str,
        *,
        host: str | None = None,
        timeout: float = 30.0,
    ) -> list[tuple[str, bytes]]:
        assert skill_name == "qoder-demo"
        return [
            (
                "SKILL.md",
                b"---\nname: qoder-demo\ndescription: from Qoder\n---\n\n# Body\n",
            )
        ]

    monkeypatch.setattr(qoder_market, "download_qoder_skill", fake_download)

    c, _srv, auth, _main_aid = env
    await seed_openai_provider(c, auth)
    aid = await create_agent(c, auth)

    r = await c.post(
        f"/api/agents/{aid}/skills/hub/install",
        headers=auth,
        json={"skill_name": "qoder-demo", "enable": True, "source": "qoder"},
    )

    assert r.status_code == 201, r.text
    assert r.json()["installed"] is True

    listed = await c.get(f"/api/agents/{aid}/skills", headers=auth)
    assert listed.status_code == 200
    slugs = [row.get("name") for row in listed.json()]
    assert "qoder-demo" in slugs
