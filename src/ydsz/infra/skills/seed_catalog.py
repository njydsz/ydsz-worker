"""Bundled skill-market seed — an offline-visible catalogue snapshot.

The snapshot ships **metadata only** (see ``scripts/refresh_seed_catalog.py``).
It exists so a fresh install shows a populated marketplace without any network
call; installing an entry still downloads its package from the marketplace,
because the skill bodies belong to their upstream authors.

Everything here is pure in-memory work over ~100 rows, so the functions are
synchronous — routing them through a thread pool would add latency for nothing.
"""

from __future__ import annotations

import json
from functools import lru_cache
from importlib import resources
from typing import Any

_SEED_RESOURCE = "seed_catalog.json"
_SECTION_NAMES = ("recommended", "trending", "hot", "newest")
_METADATA_FIELDS = ("version", "generated_at", "origin", "notice")


class SeedCatalogError(RuntimeError):
    """The bundled seed snapshot is missing or malformed."""


@lru_cache(maxsize=1)
def _load() -> tuple[dict[str, Any], tuple[dict[str, Any], ...]]:
    raw = resources.files("ydsz.infra.skills").joinpath(_SEED_RESOURCE).read_text(encoding="utf-8")
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise SeedCatalogError(f"seed catalog is not valid JSON: {exc}") from exc
    if not isinstance(payload, dict) or not isinstance(payload.get("skills"), list):
        raise SeedCatalogError("seed catalog must contain a skills array")
    rows = tuple(
        row
        for row in payload["skills"]
        if isinstance(row, dict) and str(row.get("slug") or "").strip()
    )
    if not rows:
        raise SeedCatalogError("seed catalog is empty")
    return payload, rows


def seed_metadata() -> dict[str, Any]:
    """Snapshot provenance for the UI (version / generated_at / origin)."""
    payload, rows = _load()
    return {**{field: payload.get(field) for field in _METADATA_FIELDS}, "count": len(rows)}


def seed_count() -> int:
    return len(_load()[1])


def _haystack(row: dict[str, Any]) -> str:
    parts = [
        row.get("slug"),
        row.get("name"),
        row.get("display_name_zh"),
        row.get("display_name_en"),
        row.get("description"),
        row.get("description_zh"),
        row.get("description_en"),
        row.get("author"),
        row.get("category"),
    ]
    tags = row.get("tags")
    if isinstance(tags, list):
        parts.extend(tags)
    return " ".join(str(part) for part in parts if part).lower()


def _by_installs(rows: tuple[dict[str, Any], ...] | list[dict[str, Any]]) -> list[dict[str, Any]]:
    return sorted(rows, key=lambda row: row.get("installs") or 0, reverse=True)


def search_seed_skills(query: str, *, limit: int = 50) -> list[dict[str, Any]]:
    """Filter the snapshot locally; an empty query returns the hottest head."""
    _payload, rows = _load()
    effective_limit = max(1, limit)
    needle = query.strip().lower()
    if not needle:
        return _by_installs(rows)[:effective_limit]
    # Every whitespace-separated term must match, so "pdf 提取" narrows instead
    # of widening the result set.
    terms = [term for term in needle.split() if term]
    matched = [row for row in rows if all(term in _haystack(row) for term in terms)]
    return _by_installs(matched)[:effective_limit]


def _rank(rows: tuple[dict[str, Any], ...], ranking_type: str, limit: int) -> list[dict[str, Any]]:
    if ranking_type == "newest":
        ordered = sorted(
            rows,
            key=lambda row: (row.get("created_at") or 0, row.get("installs") or 0),
            reverse=True,
        )
        return ordered[:limit]
    if ranking_type == "featured":
        official = [row for row in rows if "OfficialSelection" in (row.get("tags") or [])]
        return _by_installs(official or rows)[:limit]
    return _by_installs(rows)[:limit]


def seed_rankings(ranking_type: str = "all", *, limit: int = 50) -> dict[str, Any]:
    """Ranking sections shaped exactly like the remote marketplaces' payload."""
    _payload, rows = _load()
    effective_limit = max(1, limit)
    if ranking_type in _SECTION_NAMES:
        return {
            "section": ranking_type,
            "skills": _rank(rows, ranking_type, effective_limit),
            "total": len(rows),
        }
    return {
        "rankings": {
            name: {
                "section": name,
                "skills": _rank(rows, name, effective_limit),
                "total": len(rows),
            }
            for name in _SECTION_NAMES
        }
    }


def get_seed_skill(slug: str) -> dict[str, Any] | None:
    """Look up one seeded entry — used to confirm a slug is ours before install."""
    _payload, rows = _load()
    for row in rows:
        if str(row.get("slug") or "") == slug:
            return row
    return None


__all__ = [
    "SeedCatalogError",
    "get_seed_skill",
    "search_seed_skills",
    "seed_count",
    "seed_metadata",
    "seed_rankings",
]
