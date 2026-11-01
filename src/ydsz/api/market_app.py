"""Standalone public FastAPI app for the Ydzs Marketplace.

This app serves the market as a public website — no authentication required.
It runs independently from the main dashboard app so that the marketplace
is accessible without login and can be embedded into the official website.

Routes (all public, no JWT):

    GET  /api/market/search             cross-type search
    GET  /api/market/{type}/list        per-type browse/search
    GET  /api/market/{type}/{identity}  detail (drawer)
    GET  /api/market/{type}/{identity}/install-info
                                        returns dashboard URL + instructions
    GET  /api/market/installed          empty for unauthenticated users
    GET  /api/market/{type}/categories  category facets

Static files::

    GET  /{full_path:path}              serves the market SPA
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from ydsz.infra.errors import ErrorCode, YdszError
from ydsz.infra.market.constants import DEFAULT_LIMIT, MARKET_ITEM_TYPES, MAX_LIMIT
from ydsz.infra.market.errors import MarketError, MarketErrorCode
from ydsz.infra.server import YdszServer
from ydsz.infra.utils.locale import resolve_request_locale

logger = logging.getLogger(__name__)

_MARKET_TYPE_CHOICES = frozenset(MARKET_ITEM_TYPES)

# URL-facing aliases (plural) map to internal singular type constants.
_TYPE_ALIAS: dict[str, str] = {
    "skills": "skill",
    "experts": "expert",
    "plugins": "plugin",
    "connectors": "connector",
}


def _resolve_type(type: str) -> str:
    t = type.strip().lower()
    t = _TYPE_ALIAS.get(t, t)
    if t not in _MARKET_TYPE_CHOICES:
        raise MarketError(MarketErrorCode.UNSUPPORTED_TYPE, f"unsupported market type: {type!r}")
    return t


def _resolve_limit(limit: int) -> int:
    return max(1, min(MAX_LIMIT, limit))


def _install_exception_handlers(app: FastAPI) -> None:
    """Register JSON exception handlers for YdszError and unhandled exceptions."""

    @app.exception_handler(YdszError)
    async def _ydsz_error(request: Request, exc: YdszError) -> JSONResponse:
        if exc.status >= 500:
            logger.error(
                "YdszError %s in %s: %s",
                exc.code.value,
                request.url.path,
                exc.message,
                exc_info=exc,
            )
        locale = resolve_request_locale(request)
        return JSONResponse(status_code=exc.status, content=exc.to_envelope(locale=locale))

    @app.exception_handler(MarketError)
    async def _market_error(request: Request, exc: MarketError) -> JSONResponse:
        locale = resolve_request_locale(request)
        status = getattr(exc, "status_code", 400)
        return JSONResponse(
            status_code=status,
            content={"error": str(exc.code), "detail": exc.message, "locale": locale},
        )

    @app.exception_handler(Exception)
    async def _unhandled(request: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled exception in %s", request.url.path)
        locale = resolve_request_locale(request)
        err = YdszError.localized(ErrorCode.INTERNAL_ERROR, locale)
        return JSONResponse(status_code=err.status, content=err.to_envelope())


def _manager_from_server(server: YdszServer) -> Any:
    """Build a MarketManager from the running ydsz server services."""
    from ydsz.infra.market.manager import MarketManager

    db = getattr(server.services, "db", None) if server.services else None
    return MarketManager(db=db)


def build_market_app(
    server: YdszServer, *, dashboard_url: str = "", cors_origins: list[str] | None = None
) -> FastAPI:
    """Build a standalone public FastAPI app for the marketplace.

    Args:
        server: running YdszServer instance (provides DB access).
        dashboard_url: the ydzs-worker dashboard URL (for "Go to Dashboard" links).
        cors_origins: allowed CORS origins for the public API.
    """
    app = FastAPI(
        title="Ydsz Marketplace",
        version="0.1.0",
        description="Public marketplace API for Ydzs Worker. No authentication required.",
        docs_url=None,
        redoc_url=None,
        openapi_url="/api/openapi.json",
    )

    app.state.ydsz_server = server
    app.state.market_dashboard_url = dashboard_url

    _install_exception_handlers(app)

    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_credentials=False,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["*"],
        )

    _register_api_routes(app)
    _register_static_routes(app)

    return app


def _register_api_routes(app: FastAPI) -> None:
    """Register all /api/market/* endpoints — all public, no auth dependency."""

    @app.get("/api/market/search")
    async def market_search(
        request: Request,
        q: str = "",
        types: str | None = None,
        category: str | None = None,
        sort: str = "relevance",
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> dict[str, Any]:
        locale = resolve_request_locale(request)

        mgr = _manager_from_server(request.app.state.ydsz_server)

        type_filter: list[str] | None = None
        if types:
            type_filter = [t.strip() for t in types.split(",") if t.strip() in _MARKET_TYPE_CHOICES]

        return await mgr.search(
            q,
            type_filter,
            category=category,
            sort=sort,
            limit=_resolve_limit(limit),
            offset=offset,
            locale=locale,
        )

    @app.get("/api/market/{type}/list")
    async def market_list(
        request: Request,
        type: str,
        q: str = "",
        category: str | None = None,
        sort: str = "relevance",
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> dict[str, Any]:
        t = _resolve_type(type)
        locale = resolve_request_locale(request)
        mgr = _manager_from_server(request.app.state.ydsz_server)

        if q:
            p = mgr.provider(t)
            result = await p.search(
                q,
                category=category,
                sort=sort,
                limit=_resolve_limit(limit),
                offset=offset,
                locale=locale,
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
            t,
            category=category,
            sort=sort,
            limit=_resolve_limit(limit),
            offset=offset,
            locale=locale,
        )

    @app.get("/api/market/{type}/{identity}")
    async def market_detail(
        request: Request,
        type: str,
        identity: str,
    ) -> dict[str, Any]:
        t = _resolve_type(type)
        locale = resolve_request_locale(request)
        mgr = _manager_from_server(request.app.state.ydsz_server)
        return await mgr.detail(t, identity, locale=locale)

    @app.get("/api/market/{type}/{identity}/install-info")
    async def market_install_info(
        type: str,
        identity: str,
        request: Request,
    ) -> dict[str, Any]:
        """Return the dashboard URL for installation.

        The public marketplace cannot install items — it redirects users
        to the main Ydzs Worker dashboard which has authentication.
        """
        dashboard = getattr(request.app.state, "market_dashboard_url", "")
        return {
            "ok": True,
            "dashboard_url": f"{dashboard}/market" if dashboard else "/market",
            "message": "Please sign in to the Ydzs Worker dashboard to install this item.",
        }

    @app.get("/api/market/installed")
    async def market_installed(
        request: Request,
        limit: int = DEFAULT_LIMIT,
        offset: int = 0,
    ) -> dict[str, Any]:
        """Anonymous users see an empty list — no auth context available."""
        mgr = _manager_from_server(request.app.state.ydsz_server)
        items = await mgr.installed(
            user_id=0,
            limit=_resolve_limit(limit),
            offset=offset,
        )
        return {
            "items": items,
            "total": len(items),
            "limit": _resolve_limit(limit),
            "offset": offset,
        }

    @app.get("/api/market/{type}/categories")
    async def market_categories(request: Request, type: str) -> dict[str, Any]:
        t = _resolve_type(type)
        mgr = _manager_from_server(request.app.state.ydsz_server)
        facets = await mgr.categories(t)
        return {"categories": facets, "type": t}


def _register_static_routes(app: FastAPI) -> None:
    """Serve the market SPA static files and handle SPA fallback."""
    market_dir = Path(__file__).parent.parent / "market"
    index_file = market_dir / "index.html"

    if not index_file.exists():
        logger.warning("Market SPA index.html not found at %s — static routes disabled", index_file)
        return

    @app.get("/{full_path:path}", include_in_schema=False)
    async def market_spa_fallback(full_path: str) -> FileResponse:
        if full_path.startswith(("api/", "ws/")):
            raise HTTPException(status_code=404, detail="Not Found")

        if full_path:
            raw_path = Path(full_path)
            if raw_path.is_absolute() or ".." in raw_path.parts:
                return FileResponse(index_file)
            candidate = (market_dir / Path(*raw_path.parts)).resolve()
            try:
                candidate.relative_to(market_dir.resolve())
            except ValueError:
                return FileResponse(index_file)
            if candidate.is_file():
                return FileResponse(candidate)

        return FileResponse(index_file)
