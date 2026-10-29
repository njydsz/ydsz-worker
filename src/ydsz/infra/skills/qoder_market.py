"""Direct HTTP client for the Qoder skill marketplace.

Qoder publishes its skill catalogue behind an anonymous JSON API and serves
packages from a public OSS bucket. Archives follow the Agent Skills layout —
one ``SKILL.md`` at the archive root, usually wrapped in a single ``<slug>/``
directory — which is the same shape SkillHub ships. Package validation is
therefore delegated to :func:`parse_skillhub_package` instead of duplicating
the ZIP hardening (entry caps, symlink rejection, compression-ratio limits,
wrapper stripping, UTF-8 repair).

Installs never fetch a caller-supplied URL: the catalogue is re-queried by
slug and the resolved URL must sit on :data:`PACKAGE_HOST_SUFFIX`.
"""

from __future__ import annotations

import asyncio
import http.client
import json
import logging
import os
import urllib.error
import urllib.parse
import urllib.request
from typing import Any
from urllib.parse import urlparse

from ydsz.infra.skills.skillhub_common import HTTP_READ_CHUNK, MAX_HTTP_BYTES
from ydsz.infra.skills.skillhub_market import (
    SkillHubPackageError,
    SkillHubPackageTooLarge,
    parse_skillhub_package,
)

logger = logging.getLogger(__name__)

DEFAULT_QODER_HOST = "https://qoder.com"
SKILLS_ENDPOINT = "/api/v1/marketplace/skills"

# Download URLs point at Qoder's public Alibaba OSS bucket. Pinning the host
# keeps a compromised or spoofed catalogue payload from turning install into
# a server-side request forgery primitive.
PACKAGE_HOST_SUFFIX = ".oss-accelerate.aliyuncs.com"

# Ranking sections mirror the dashboard's tabs (SkillHub exposes the same
# names). Qoder has no native ranking endpoint, so sections are derived
# locally from the head of the catalogue — see ``_rank_rows``.
RANKING_TYPES = ("all", "hot", "recommended", "trending", "featured", "newest")
_SECTION_NAMES = ("recommended", "trending", "hot", "newest")

_MAX_JSON_BYTES = 8 * 1024 * 1024
_MAX_PAGE_SIZE = 200
# Sorting locally only needs the head of the catalogue; pulling thousands of
# rows per ranking tab would cost bandwidth for no visible benefit.
_RANKING_SCAN_SIZE = 200


class QoderMarketError(RuntimeError):
    """A Qoder marketplace HTTP request failed."""


class QoderSkillNotFound(QoderMarketError):
    """The catalogue has no downloadable package for the requested slug."""


class QoderMarketTimeout(QoderMarketError):
    """A Qoder marketplace HTTP request timed out."""


class QoderPackageError(QoderMarketError):
    """A downloaded Qoder package failed validation."""


class QoderPackageTooLarge(QoderPackageError):
    """A downloaded Qoder package exceeded a safety limit."""


def _resolve_host(host: str | None) -> str:
    resolved = (host or "").strip() or os.environ.get("QODER_MARKET_HOST", "").strip()
    resolved = (resolved or DEFAULT_QODER_HOST).rstrip("/")
    parsed = urlparse(resolved)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise QoderMarketError(f"Invalid Qoder marketplace host: {resolved}")
    return resolved


def _http_request(
    url: str,
    *,
    accept: str,
    timeout: float,
    max_bytes: int,
) -> bytes:
    request = urllib.request.Request(
        url,
        headers={
            "Accept": accept,
            "User-Agent": "ydsz-qoder-market/1.0",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            headers = getattr(response, "headers", None)
            content_length = headers.get("Content-Length") if headers is not None else None
            if content_length:
                try:
                    declared_size = int(content_length)
                except ValueError:
                    declared_size = 0
                if declared_size > max_bytes:
                    raise QoderPackageTooLarge(
                        f"Qoder response exceeds {max_bytes // (1024 * 1024)} MB"
                    )

            chunks: list[bytes] = []
            total = 0
            while True:
                chunk = response.read(HTTP_READ_CHUNK)
                if not chunk:
                    break
                total += len(chunk)
                if total > max_bytes:
                    raise QoderPackageTooLarge(
                        f"Qoder response exceeds {max_bytes // (1024 * 1024)} MB"
                    )
                chunks.append(chunk)
            return b"".join(chunks)
    except QoderPackageError:
        raise
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            raise QoderSkillNotFound(f"Qoder resource not found: HTTP {exc.code}") from exc
        raise QoderMarketError(f"Qoder request failed: HTTP {exc.code}") from exc
    except urllib.error.URLError as exc:
        if isinstance(exc.reason, TimeoutError):
            raise QoderMarketTimeout("Qoder request timed out") from exc
        raise QoderMarketError(f"Qoder request failed: {exc.reason}") from exc
    except TimeoutError as exc:
        raise QoderMarketTimeout("Qoder request timed out") from exc
    except (http.client.HTTPException, OSError) as exc:
        raise QoderMarketError(f"Qoder request failed: {exc}") from exc


def _as_int(value: object) -> int:
    if isinstance(value, bool):
        return 0
    if isinstance(value, int):
        return value
    if isinstance(value, str):
        try:
            return int(value)
        except ValueError:
            return 0
    return 0


def _normalize_row(raw: dict[str, Any]) -> dict[str, Any] | None:
    """Map one catalogue row onto the dashboard's hub-card shape.

    Field names mirror what SkillHub returns (``slug`` / ``name`` /
    ``description`` / ``description_zh`` / ``icon_url``) so the existing
    market UI renders either source without branching.
    """
    slug = str(raw.get("skill_name") or "").strip()
    if not slug:
        return None
    display_zh = str(raw.get("skill_name_cn") or "").strip()
    display_en = str(raw.get("display_name") or raw.get("skill_name") or "").strip()
    description_zh = str(raw.get("description_cn") or "").strip()
    description_en = str(raw.get("description") or "").strip()
    raw_tags = raw.get("tags")
    tags = [tag for tag in raw_tags if isinstance(tag, str)] if isinstance(raw_tags, list) else []
    return {
        "slug": slug,
        "name": display_zh or display_en or slug,
        "display_name_zh": display_zh,
        "display_name_en": display_en,
        "description": description_zh or description_en,
        "description_zh": description_zh,
        "description_en": description_en,
        "version": str(raw.get("version") or "").strip(),
        "author": str(raw.get("author_name") or raw.get("author") or "").strip(),
        "icon_url": str(raw.get("icon_url") or "").strip(),
        "category": str(raw.get("category") or "").strip(),
        "installs": _as_int(raw.get("install_count")),
        "created_at": _as_int(raw.get("created_at")),
        "source": "qoder",
        "tags": tags,
    }


def _fetch_page(
    host: str,
    *,
    keyword: str = "",
    category: str = "",
    page: int = 1,
    page_size: int = 20,
    timeout: float,
) -> dict[str, Any]:
    params: dict[str, str] = {
        "page": str(max(1, page)),
        "page_size": str(max(1, min(page_size, _MAX_PAGE_SIZE))),
    }
    # ``keyword`` is the only filter the API honours; ``q`` / ``search`` are
    # silently ignored and return the unfiltered catalogue.
    if keyword:
        params["keyword"] = keyword
    if category:
        params["category"] = category

    payload = _http_request(
        f"{host}{SKILLS_ENDPOINT}?{urllib.parse.urlencode(params)}",
        accept="application/json",
        timeout=timeout,
        max_bytes=_MAX_JSON_BYTES,
    )
    try:
        data = json.loads(payload.decode("utf-8"))
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise QoderMarketError(f"Invalid JSON from Qoder marketplace: {exc}") from exc
    if not isinstance(data, dict) or not isinstance(data.get("skills"), list):
        raise QoderMarketError("Qoder marketplace response must contain a skills array")
    return data


def _rows(data: dict[str, Any]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for raw in data["skills"]:
        if not isinstance(raw, dict):
            continue
        row = _normalize_row(raw)
        if row is not None:
            rows.append(row)
    return rows


def _search_sync(
    host: str,
    query: str,
    *,
    limit: int,
    page: int,
    category: str,
    timeout: float,
) -> list[dict[str, Any]]:
    data = _fetch_page(
        host,
        keyword=query.strip(),
        category=category.strip(),
        page=page,
        page_size=max(1, min(limit, _MAX_PAGE_SIZE)),
        timeout=timeout,
    )
    return _rows(data)[: max(1, limit)]


def _rank_rows(
    rows: list[dict[str, Any]],
    ranking_type: str,
    limit: int,
) -> list[dict[str, Any]]:
    if ranking_type == "newest":
        ordered = sorted(
            rows,
            key=lambda row: (row["created_at"], row["installs"]),
            reverse=True,
        )
        return ordered[:limit]
    if ranking_type == "featured":
        official = [row for row in rows if "OfficialSelection" in row["tags"]]
        pool = official or rows
        return sorted(pool, key=lambda row: row["installs"], reverse=True)[:limit]
    # hot / recommended / trending all reduce to install count: the catalogue
    # exposes no separate trend signal and its default order is only roughly
    # heat-sorted (verified against the live API).
    return sorted(rows, key=lambda row: row["installs"], reverse=True)[:limit]


def _ranking_section_sync(
    host: str,
    ranking_type: str,
    *,
    limit: int,
    timeout: float,
) -> dict[str, Any]:
    data = _fetch_page(host, page=1, page_size=_RANKING_SCAN_SIZE, timeout=timeout)
    rows = _rows(data)
    section = _rank_rows(rows, ranking_type, max(1, limit))
    return {
        "section": ranking_type,
        "skills": section,
        "total": _as_int((data.get("pages") or {}).get("total_size")),
    }


async def search_qoder_skills(
    query: str,
    *,
    limit: int = 50,
    page: int = 1,
    category: str = "",
    host: str | None = None,
    timeout: float = 10.0,
) -> list[dict[str, Any]]:
    """Search the public Qoder skill catalogue over HTTP."""
    return await asyncio.to_thread(
        _search_sync,
        _resolve_host(host),
        query,
        limit=limit,
        page=page,
        category=category,
        timeout=timeout,
    )


async def fetch_qoder_rankings(
    ranking_type: str = "all",
    *,
    limit: int = 50,
    host: str | None = None,
    timeout: float = 10.0,
) -> dict[str, Any]:
    """Fetch one ranking section or all sections.

    ``all`` returns ``{"rankings": {name: {section, skills, total}}}`` — the
    same envelope SkillHub uses, so the dashboard renders both sources with
    one code path. Every section derives from the same catalogue head, so it
    is fetched once and sliced locally rather than requested four times.
    """
    resolved_host = _resolve_host(host)
    rtype = ranking_type if ranking_type in RANKING_TYPES else "all"
    if rtype != "all":
        return await asyncio.to_thread(
            _ranking_section_sync,
            resolved_host,
            rtype,
            limit=limit,
            timeout=timeout,
        )

    data = await asyncio.to_thread(
        _fetch_page,
        resolved_host,
        page=1,
        page_size=_RANKING_SCAN_SIZE,
        timeout=timeout,
    )
    rows = _rows(data)
    total = _as_int((data.get("pages") or {}).get("total_size"))
    effective_limit = max(1, limit)
    return {
        "rankings": {
            name: {
                "section": name,
                "skills": _rank_rows(rows, name, effective_limit),
                "total": total,
            }
            for name in _SECTION_NAMES
        }
    }


def parse_qoder_package(payload: bytes) -> list[tuple[str, bytes]]:
    """Validate a Qoder ZIP and return workspace-relative file payloads."""
    try:
        return parse_skillhub_package(payload)
    except SkillHubPackageTooLarge as exc:
        raise QoderPackageTooLarge(str(exc)) from exc
    except SkillHubPackageError as exc:
        raise QoderPackageError(str(exc)) from exc


def _assert_package_url(url: str) -> str:
    parsed = urlparse(url)
    hostname = (parsed.hostname or "").lower()
    if parsed.scheme != "https" or not hostname.endswith(PACKAGE_HOST_SUFFIX):
        raise QoderMarketError("Qoder package URL is not on the expected package host")
    return url


def _resolve_download_url(host: str, skill_name: str, *, timeout: float) -> str:
    """Look up the package URL for *skill_name* from the catalogue.

    The slug is resolved server-side rather than accepted from the caller so
    install cannot be pointed at an arbitrary URL.
    """
    data = _fetch_page(
        host,
        keyword=skill_name,
        page_size=_MAX_PAGE_SIZE,
        timeout=timeout,
    )
    for raw in data["skills"]:
        if not isinstance(raw, dict):
            continue
        if str(raw.get("skill_name") or "").strip() != skill_name:
            continue
        url = str(raw.get("download_url") or "").strip()
        if url:
            return _assert_package_url(url)
    raise QoderSkillNotFound(f"Qoder skill {skill_name!r} has no downloadable package")


def download_qoder_skill_files(
    skill_name: str,
    *,
    host: str | None = None,
    timeout: float = 30.0,
) -> list[tuple[str, bytes]]:
    """Synchronously download and validate one public Qoder skill package."""
    resolved_host = _resolve_host(host)
    url = _resolve_download_url(resolved_host, skill_name, timeout=timeout)
    payload = _http_request(
        url,
        accept="application/zip,application/octet-stream,*/*",
        timeout=timeout,
        max_bytes=MAX_HTTP_BYTES,
    )
    return parse_qoder_package(payload)


async def download_qoder_skill(
    skill_name: str,
    *,
    host: str | None = None,
    timeout: float = 30.0,
) -> list[tuple[str, bytes]]:
    """Download and validate a public Qoder skill package over HTTP."""
    return await asyncio.to_thread(
        download_qoder_skill_files,
        skill_name,
        host=host,
        timeout=timeout,
    )


__all__ = [
    "DEFAULT_QODER_HOST",
    "PACKAGE_HOST_SUFFIX",
    "RANKING_TYPES",
    "SKILLS_ENDPOINT",
    "QoderMarketError",
    "QoderMarketTimeout",
    "QoderPackageError",
    "QoderPackageTooLarge",
    "QoderSkillNotFound",
    "download_qoder_skill",
    "download_qoder_skill_files",
    "fetch_qoder_rankings",
    "parse_qoder_package",
    "search_qoder_skills",
]
