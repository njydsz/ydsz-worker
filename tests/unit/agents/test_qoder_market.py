"""Tests for the direct HTTP Qoder marketplace client."""

from __future__ import annotations

import asyncio
import io
import json
import urllib.error
import urllib.parse
import zipfile
from typing import Any

import pytest

from ydsz.infra.skills import qoder_market


class _BytesResponse:
    def __init__(self, payload: bytes, *, headers: dict[str, str] | None = None) -> None:
        self._stream = io.BytesIO(payload)
        self.headers = headers or {}

    def __enter__(self) -> _BytesResponse:
        return self

    def __exit__(self, *_args: object) -> None:
        return None

    def read(self, size: int = -1) -> bytes:
        return self._stream.read(size)


def _zip_bytes(files: dict[str, bytes | str]) -> bytes:
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name, content in files.items():
            archive.writestr(name, content)
    return buffer.getvalue()


def _catalogue(rows: list[dict[str, Any]], *, total: int = 43523) -> bytes:
    return json.dumps(
        {
            "skills": rows,
            "pages": {"page_size": 200, "total_size": total, "current_page": 1},
        }
    ).encode()


def _row(
    slug: str,
    *,
    installs: int = 0,
    created_at: int = 0,
    tags: list[str] | None = None,
    download_url: str = "",
) -> dict[str, Any]:
    return {
        "skill_name": slug,
        "skill_name_cn": f"{slug}-中文",
        "display_name": slug,
        "description": f"{slug} english",
        "description_cn": f"{slug} 中文说明",
        "version": "1.0.0",
        "author_name": "tester",
        "icon_url": "",
        "category": "devops",
        "install_count": installs,
        "created_at": created_at,
        "tags": tags or [],
        "download_url": download_url,
    }


def test_search_maps_catalogue_rows_and_sends_keyword(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    seen: dict[str, Any] = {}

    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        seen["url"] = request.full_url
        seen["accept"] = request.headers["Accept"]
        return _BytesResponse(_catalogue([_row("pdf-extractor", installs=9022)]))

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    result = qoder_market._search_sync(
        "https://qoder.example.com",
        "pdf",
        limit=12,
        page=1,
        category="",
        timeout=7,
    )

    parsed = urllib.parse.urlparse(seen["url"])
    assert parsed.path == "/api/v1/marketplace/skills"
    params = urllib.parse.parse_qs(parsed.query)
    assert params["keyword"] == ["pdf"]
    assert params["page"] == ["1"]
    assert params["page_size"] == ["12"]
    assert seen["accept"] == "application/json"
    assert result == [
        {
            "slug": "pdf-extractor",
            "name": "pdf-extractor-中文",
            "display_name_zh": "pdf-extractor-中文",
            "display_name_en": "pdf-extractor",
            "description": "pdf-extractor 中文说明",
            "description_zh": "pdf-extractor 中文说明",
            "description_en": "pdf-extractor english",
            "version": "1.0.0",
            "author": "tester",
            "icon_url": "",
            "category": "devops",
            "installs": 9022,
            "created_at": 0,
            "source": "qoder",
            "tags": [],
        }
    ]


def test_search_omits_keyword_when_query_is_blank(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    seen: dict[str, Any] = {}

    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        seen["url"] = request.full_url
        return _BytesResponse(_catalogue([]))

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    qoder_market._search_sync(
        "https://qoder.example.com",
        "   ",
        limit=5,
        page=1,
        category="",
        timeout=5,
    )

    params = urllib.parse.parse_qs(urllib.parse.urlparse(seen["url"]).query)
    assert "keyword" not in params


def test_rows_without_a_slug_are_dropped(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(
        qoder_market.urllib.request,
        "urlopen",
        lambda request, timeout: _BytesResponse(_catalogue([{"skill_name": "  "}, _row("kept")])),
    )

    rows = qoder_market._search_sync(
        "https://qoder.example.com", "", limit=5, page=1, category="", timeout=5
    )

    assert [row["slug"] for row in rows] == ["kept"]


def test_rankings_all_returns_four_sections_sorted_by_installs(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    rows = [
        _row("low", installs=1, created_at=900),
        _row("high", installs=900, created_at=100),
        _row("mid", installs=50, created_at=500),
    ]
    monkeypatch.setattr(
        qoder_market.urllib.request,
        "urlopen",
        lambda request, timeout: _BytesResponse(_catalogue(rows)),
    )

    payload = asyncio.run(
        qoder_market.fetch_qoder_rankings("all", limit=2, host="https://qoder.example.com")
    )

    assert set(payload["rankings"]) == {"recommended", "trending", "hot", "newest"}
    assert [row["slug"] for row in payload["rankings"]["hot"]["skills"]] == ["high", "mid"]
    assert [row["slug"] for row in payload["rankings"]["newest"]["skills"]] == [
        "low",
        "mid",
    ]
    assert payload["rankings"]["hot"]["total"] == 43523


def test_rankings_all_issues_a_single_catalogue_request(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    calls: list[str] = []

    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        calls.append(request.full_url)
        return _BytesResponse(_catalogue([_row("a", installs=1)]))

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    asyncio.run(qoder_market.fetch_qoder_rankings("all", limit=3, host="https://qoder.example.com"))

    assert len(calls) == 1


def test_featured_ranking_prefers_official_selection(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    rows = [
        _row("popular", installs=1000),
        _row("official", installs=5, tags=["OfficialSelection"]),
    ]
    monkeypatch.setattr(
        qoder_market.urllib.request,
        "urlopen",
        lambda request, timeout: _BytesResponse(_catalogue(rows)),
    )

    payload = asyncio.run(
        qoder_market.fetch_qoder_rankings("featured", limit=5, host="https://qoder.example.com")
    )

    assert payload["section"] == "featured"
    assert [row["slug"] for row in payload["skills"]] == ["official"]


def test_download_strips_single_wrapper_directory(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    archive = _zip_bytes({"deep-research/SKILL.md": "---\nname: deep-research\n---\nbody"})
    package_url = (
        "https://qoder-skills.oss-accelerate.aliyuncs.com/public/deep-research/latest/x.zip"
    )

    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        if "marketplace/skills" in request.full_url:
            return _BytesResponse(_catalogue([_row("deep-research", download_url=package_url)]))
        assert request.full_url == package_url
        return _BytesResponse(archive)

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    files = qoder_market.download_qoder_skill_files(
        "deep-research", host="https://qoder.example.com"
    )

    assert [name for name, _content in files] == ["SKILL.md"]


def test_download_rejects_a_package_url_outside_the_oss_bucket(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    hostile = "https://attacker.example.com/public/x.zip"

    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        return _BytesResponse(_catalogue([_row("x", download_url=hostile)]))

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    with pytest.raises(qoder_market.QoderMarketError, match="expected package host"):
        qoder_market.download_qoder_skill_files("x", host="https://qoder.example.com")


def test_download_rejects_a_slug_the_catalogue_does_not_list(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(
        qoder_market.urllib.request,
        "urlopen",
        lambda request, timeout: _BytesResponse(_catalogue([_row("other")])),
    )

    with pytest.raises(qoder_market.QoderSkillNotFound):
        qoder_market.download_qoder_skill_files("missing", host="https://qoder.example.com")


def test_download_rejects_a_package_without_a_root_manifest(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    package_url = "https://qoder-skills.oss-accelerate.aliyuncs.com/public/x/latest/x.zip"
    archive = _zip_bytes({"notes.md": "no manifest here"})

    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        if "marketplace/skills" in request.full_url:
            return _BytesResponse(_catalogue([_row("x", download_url=package_url)]))
        return _BytesResponse(archive)

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    with pytest.raises(qoder_market.QoderPackageError, match="root SKILL.md"):
        qoder_market.download_qoder_skill_files("x", host="https://qoder.example.com")


def test_search_reports_timeouts(monkeypatch: pytest.MonkeyPatch) -> None:
    def fake_urlopen(request: Any, timeout: float) -> _BytesResponse:
        raise urllib.error.URLError(TimeoutError("slow"))

    monkeypatch.setattr(qoder_market.urllib.request, "urlopen", fake_urlopen)

    with pytest.raises(qoder_market.QoderMarketTimeout):
        qoder_market._search_sync(
            "https://qoder.example.com", "x", limit=1, page=1, category="", timeout=1
        )


def test_invalid_host_is_rejected() -> None:
    with pytest.raises(qoder_market.QoderMarketError, match="Invalid Qoder marketplace host"):
        qoder_market._resolve_host("file:///etc/passwd")
