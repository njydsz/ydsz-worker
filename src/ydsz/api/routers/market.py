"""Market router — unified browse/search/install for all capability types.

Thin orchestration layer over :class:`ydsz.infra.market.manager.MarketManager`.

Routes::

    GET  /api/market/search             cross-type search
    GET  /api/market/{type}/list        per-type browse/search
    GET  /api/market/{type}/{identity}  detail (drawer)
    POST /api/market/{type}/{identity}/install
    GET  /api/market/installed          user's installed items (cross-type)
    GET  /api/market/{type}/categories  category facets
"""

from __future__ import annotations

import logging
from typing import Any, Literal

from fastapi import APIRouter, Depends, Query, Request

from ydsz.api.deps import current_user, get_server
from ydsz.infra.market.constants import DEFAULT_LIMIT, MARKET_ITEM_TYPES, MAX_LIMIT
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.market.models import InstallTarget
from ydsz.infra.utils.locale import resolve_request_locale

logger = logging.getLogger(__name__)

router = APIRouter()

_MARKET_TYPE_CHOICES = frozenset(MARKET_ITEM_TYPES)


def _manager(request: Request) -> Any:
    """Resolve MarketManager from server services."""
    server = get_server(request)
    db = getattr(server.services, "db", None)
    from ydsz.infra.market.manager import MarketManager
    return MarketManager(db=db)


# ── helpers ─────────────────────────────────────────────────────────────────
def _resolve_type(type: str) -> str:
    t = type.strip().lower()
    if t not in _MARKET_TYPE_CHOICES:
        raise MarketError(
            MarketErrorCode.UNSUPPORTED_TYPE,
            f"unsupported market type: {type!r}",
        )
    return t


def _resolve_limit(limit: int) -> int:
    return max(1, min(MAX_LIMIT, limit))


def _resolve_user_id(user: Any) -> int:
    """Extract numeric user.id from the current_user dependency object."""
    return int(getattr(user, "id", user))


# ── search ──────────────────────────────────────────────────────────────────
@router.get("/search", summary="Cross-type market search")
async def market_search(
    request: Request,
    q: str = Query(default="", description="Search query"),
    types: str | None = Query(default=None, description="Comma-separated type filter"),
    category: str | None = Query(default=None),
    sort: str = Query(default="relevance", description="relevance|downloads|rating|newest"),
    limit: int = Query(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
    user: Any = Depends(current_user),
) -> dict[str, Any]:
    """Aggregated search across capability markets."""
    locale = resolve_request_locale(request)
    mgr = _manager(request)

    type_filter: list[str] | None = None
    if types:
        type_filter = [t.strip() for t in types.split(",") if t.strip() in _MARKET_TYPE_CHOICES]

    return await mgr.search(
        q, type_filter,
        category=category, sort=sort,
        limit=_resolve_limit(limit), offset=offset,
        locale=locale,
    )


# ── list (per-type browse) ──────────────────────────────────────────────────
@router.get("/{type}/list", summary="Browse one market type")
async def market_list(
    request: Request,
    type: str,
    q: str = Query(default="", description="Optional search within type"),
    category: str | None = Query(default=None),
    sort: str = Query(default="relevance"),
    limit: int = Query(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
    user: Any = Depends(current_user),
) -> dict[str, Any]:
    """Browse or search within one market type."""
    t = _resolve_type(type)
    locale = resolve_request_locale(request)
    mgr = _manager(request)

    if q:
        # Delegate to provider search.
        p = mgr.provider(t)
        result = await p.search(
            q, category=category, sort=sort,
            limit=_resolve_limit(limit), offset=offset, locale=locale,
        )
        from ydsz.infra.market.search import _item_to_dict
        return {
            "items": [_item_to_dict(i) for i in result.items],
            "total": result.total,
            "limit": result.limit,
            "offset": result.offset,
            "sort": result.sort,
            "category": result.category,
            "type": t,
        }

    return await mgr.browse(
        t, category=category, sort=sort,
        limit=_resolve_limit(limit), offset=offset, locale=locale,
    )


# ── detail ─────────────────────────────────────────────────────────────────
@router.get("/{type}/{identity}", summary="Market item detail (drawer)")
async def market_detail(
    request: Request,
    type: str,
    identity: str,
    user: Any = Depends(current_user),
) -> dict[str, Any]:
    """Full detail for the right-side drawer."""
    t = _resolve_type(type)
    locale = resolve_request_locale(request)
    mgr = _manager(request)
    return await mgr.detail(t, identity, locale=locale)


# ── install ────────────────────────────────────────────────────────────────
_MARKET_TYPE_PATH: Literal["skill", "expert", "plugin", "connector"]  # for FastAPI path validation


@router.post("/{type}/{identity}/install", summary="Install a market item")
async def market_install(
    request: Request,
    type: str,
    identity: str,
    body: dict[str, Any] | None = None,
    user: Any = Depends(current_user),
) -> dict[str, Any]:
    """Install one capability to a target (agent/workspace/package)."""
    t = _resolve_type(type)
    body = body or {}
    resolve_request_locale(request)
    mgr = _manager(request)
    user_id = _resolve_user_id(user)

    # Resolve target.
    target = _parse_install_target(body, user_id)
    return await mgr.install(t, identity, target=target, user_id=user_id, **body)


def _parse_install_target(body: dict[str, Any], user_id: int) -> InstallTarget:
    """Derive an InstallTarget from the install body.

    For skills: ``target_type=agent`` with ``target_id=agent_id``.
    For plugins: ``target_type=plugin_dir`` with ``target_id=<dir>``.
    For experts: ``target_type=agent`` (creates new agent).
    For connectors: ``target_type=connector_instance``.
    """
    target_type = body.get("target_type")
    target_id = body.get("target_id")

    if target_type and target_id:
        return InstallTarget(type=target_type, id=target_id)

    # Convenience: infer from ``agent_id`` param.
    if body.get("agent_id"):
        return InstallTarget(type="agent", id=body["agent_id"])

    raise MarketError(
        MarketErrorCode.INVALID_TARGET,
        "install requires target_type+target_id or agent_id",
    )


# ── installed view ──────────────────────────────────────────────────────────
@router.get("/installed", summary="User's installed market items (cross-type)")
async def market_installed(
    request: Request,
    limit: int = Query(default=DEFAULT_LIMIT, ge=1, le=MAX_LIMIT),
    offset: int = Query(default=0, ge=0),
    user: Any = Depends(current_user),
) -> dict[str, Any]:
    """Return all market items this user has installed."""
    mgr = _manager(request)
    user_id = _resolve_user_id(user)
    items = await mgr.installed(
        user_id=user_id, limit=_resolve_limit(limit), offset=offset,
    )
    return {"items": items, "total": len(items), "limit": _resolve_limit(limit), "offset": offset}


# ── categories ──────────────────────────────────────────────────────────────
@router.get("/{type}/categories", summary="Category facets for one market type")
async def market_categories(
    request: Request,
    type: str,
    user: Any = Depends(current_user),
) -> dict[str, Any]:
    """Return category facets for filter bar."""
    t = _resolve_type(type)
    mgr = _manager(request)
    facets = await mgr.categories(t)
    return {"categories": facets, "type": t}
