"""Unit tests for MCP OAuth authorize URL construction (issue #2391)."""

from __future__ import annotations

from urllib.parse import parse_qs, urlsplit

from ydsz.infra.connectors.oauth.mcp import build_authorize_url


def _query(url: str) -> dict[str, list[str]]:
    return parse_qs(urlsplit(url).query)


def test_build_authorize_url_preserves_existing_query_params() -> None:
    url = build_authorize_url(
        {"authorization_endpoint": "https://auth.example.com/authorize?tenant=acme"},
        client_id="demo-client",
        redirect_uri="https://client.example/callback",
        state="demo-state",
        code_challenge="demo-challenge",
    )
    q = _query(url)
    assert q["tenant"] == ["acme"]
    assert q["response_type"] == ["code"]
    assert q["client_id"] == ["demo-client"]


def test_build_authorize_url_without_existing_query() -> None:
    url = build_authorize_url(
        {"authorization_endpoint": "https://auth.example.com/authorize"},
        client_id="demo-client",
        redirect_uri="https://client.example/callback",
        state="demo-state",
        code_challenge="demo-challenge",
    )
    q = _query(url)
    assert q["response_type"] == ["code"]
    assert q["code_challenge_method"] == ["S256"]
    assert "tenant" not in q


def test_build_authorize_url_oauth_params_win_on_conflict() -> None:
    url = build_authorize_url(
        {"authorization_endpoint": "https://auth.example.com/authorize?response_type=token"},
        client_id="demo-client",
        redirect_uri="https://client.example/callback",
        state="demo-state",
        code_challenge="demo-challenge",
    )
    assert _query(url)["response_type"] == ["code"]
