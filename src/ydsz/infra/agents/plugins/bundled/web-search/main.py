"""Web search via DuckDuckGo Instant Answer API (no API key required)."""

from __future__ import annotations

import json
from typing import Any

import httpx
from ydsz_harness.plugins import PluginContext


_SEARCH_URL = "https://api.duckduckgo.com/"


def _payload(renderer: str, data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": renderer, "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


async def web_search(query: str, max_results: int = 5) -> str:
    """搜索实时信息。query 为搜索关键词（中英文均可），max_results 返回条数（1–10，默认 5）。"""
    query = (query or "").strip()
    if not query:
        return _payload(
            "web_search",
            {"error": "query is required"},
            "请提供搜索关键词。",
        )
    num = max(1, min(int(max_results or 5), 10))
    try:
        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            resp = client.get(
                _SEARCH_URL,
                params={
                    "q": query,
                    "format": "json",
                    "no_redirect": 1,
                    "no_html": 1,
                    "skip_disambig": 1,
                },
            )
            resp.raise_for_status()
            raw = resp.json()
    except Exception as exc:
        return _payload(
            "web_search",
            {"query": query, "error": str(exc)},
            f"搜索失败：{exc}",
        )

    results: list[dict[str, Any]] = []

    # Abstract (top answer)
    abstract = str(raw.get("Abstract") or "").strip()
    abstract_url = str(raw.get("AbstractURL") or "").strip()
    abstract_source = str(raw.get("AbstractSource") or "").strip()
    # Top-level Results
    for item in raw.get("Results") or []:
        if not isinstance(item, dict):
            continue
        text_val = str(item.get("Text") or "").strip()
        url_val = str(item.get("FirstURL") or "").strip()
        if text_val and url_val:
            results.append(
                {
                    "title": text_val[:80],
                    "url": url_val,
                    "snippet": text_val,
                    "source": abstract_source or "DuckDuckGo",
                }
            )

    # RelatedTopics (may be nested)
    def _walk_topics(topics: object) -> None:
        if isinstance(topics, list):
            for t in topics:
                _walk_topics(t)
        elif isinstance(topics, dict):
            if "Text" in topics and "FirstURL" in topics:
                text_val = str(topics.get("Text") or "").strip()
                url_val = str(topics.get("FirstURL") or "").strip()
                if text_val and url_val:
                    results.append(
                        {
                            "title": text_val[:80],
                            "url": url_val,
                            "snippet": text_val,
                            "source": abstract_source or "DuckDuckGo",
                        }
                    )
            for sub in ("Topics", "RelatedTopics"):
                if sub in topics:
                    _walk_topics(topics[sub])

    _walk_topics(raw.get("RelatedTopics"))

    # Add abstract as first result if no other results and abstract exists
    if not results and abstract:
        results.append(
            {
                "title": abstract[:80],
                "url": abstract_url,
                "snippet": abstract,
                "source": abstract_source or "DuckDuckGo",
            }
        )

    # Deduplicate by url
    seen: set[str] = set()
    deduped: list[dict[str, Any]] = []
    for r in results:
        u = r.get("url", "")
        if u in seen:
            continue
        seen.add(u)
        deduped.append(r)
    results = deduped[:num]

    data: dict[str, Any] = {"query": query, "results": results}
    text = f"搜索「{query}」找到 {len(results)} 条结果"
    return _payload("web_search", data, text)


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "web_search",
        web_search,
        description=(
            "通过 DuckDuckGo 搜索实时信息。query 为搜索关键词（中英文均可），"
            "max_results 为返回条数（1–10，默认 5）。无需 API Key。"
        ),
    )
