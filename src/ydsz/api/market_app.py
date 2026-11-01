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


# ── Demo fallback data (served when SkillHub / DB is empty) ────────────────
# This guarantees the standalone marketplace always shows something useful,
# even without internet connectivity or installed packages.

_DEMO_ITEMS: list[dict[str, Any]] = [
    {
        "market_id": "demo-skill-001", "type": "skill", "source": "community",
        "identity": "web-scraper", "name": "网页抓取工具",
        "description": "智能解析任意网页内容，抽取结构化数据，支持自动翻页和定时抓取。",
        "icon_url": None, "icon_name": "Globe", "color": "#1677ff", "version": "1.2.0",
        "author": {"name": "Ydsz"}, "category": "PRODUCTIVITY",
        "tags": ["爬虫", "数据采集", "自动化"], "rating": 4.6, "downloads": 5600,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/web-scraper",
        "updated_at": "2026-09-15T10:30:00Z",
        "metadata": {"quick_prompts": ["抽取页面所有链接", "转为 Markdown"]},
    },
    {
        "market_id": "demo-skill-002", "type": "skill", "source": "community",
        "identity": "sql-analyzer", "name": "SQL 数据分析",
        "description": "自然语言转 SQL 查询，支持 MySQL / PostgreSQL / SQLite，一键生成可视化报表。",
        "icon_url": None, "icon_name": "Database", "color": "#722ed1", "version": "2.0.1",
        "author": {"name": "DataTeam"}, "category": "DATA",
        "tags": ["SQL", "数据分析", "可视化"], "rating": 4.8, "downloads": 8230,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/sql-analyzer",
        "updated_at": "2026-10-01T08:00:00Z",
        "metadata": {"quick_prompts": ["查询销售趋势", "生成日报"]},
    },
    {
        "market_id": "demo-skill-003", "type": "skill", "source": "builtin",
        "identity": "email-assistant", "name": "邮件智能助手",
        "description": "自动分类收件箱、提取待办、生成回复草稿，支持多邮箱聚合。",
        "icon_url": None, "icon_name": "Mail", "color": "#fa8c16", "version": "1.0.3",
        "author": {"name": "Ydsz"}, "category": "PRODUCTIVITY",
        "tags": ["邮件", "助理", "分类"], "rating": 4.4, "downloads": 3210,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/email-assistant",
        "updated_at": "2026-08-20T14:20:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-skill-004", "type": "skill", "source": "builtin",
        "identity": "pdf-reader", "name": "PDF 语义问答",
        "description": "上传任意 PDF，基于 RAG 进行语义检索式问答，支持批量文档。",
        "icon_url": None, "icon_name": "FileText", "color": "#52c41a", "version": "1.1.0",
        "author": {"name": "Ydsz"}, "category": "NLP",
        "tags": ["PDF", "RAG", "问答"], "rating": 4.7, "downloads": 6890,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/pdf-reader",
        "updated_at": "2026-10-10T09:15:00Z",
        "metadata": {"dependencies": ["vectordb"]},
    },
    {
        "market_id": "demo-skill-005", "type": "skill", "source": "community",
        "identity": "translate-pro", "name": "专业翻译引擎",
        "description": "多语言专业翻译，支持技术文档、法律合同、医学论文等专业领域。",
        "icon_url": None, "icon_name": "Languages", "color": "#13c2c2", "version": "1.5.2",
        "author": {"name": "Ydsz"}, "category": "NLP",
        "tags": ["翻译", "多语言", "文档"], "rating": 4.5, "downloads": 4350,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/translate-pro",
        "updated_at": "2026-09-28T11:00:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-expert-001", "type": "expert", "source": "community",
        "identity": "excel-master", "name": "Excel 高级分析专家",
        "description": "精通 Excel 公式、VBA、数据透视表，可自动清洗数据并生成分析报告。",
        "icon_url": None, "icon_name": "Table", "color": "#52c41a", "version": "1.3.0",
        "author": {"name": "BizTools"}, "category": "OFFICE",
        "tags": ["Excel", "报表", "办公"], "rating": 4.5, "downloads": 4520,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/excel-master",
        "updated_at": "2026-09-05T16:45:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-expert-002", "type": "expert", "source": "builtin",
        "identity": "code-reviewer", "name": "代码审查官",
        "description": "深度代码审查 + 重构建议，支持 20+ 编程语言，符合企业级编码规范。",
        "icon_url": None, "icon_name": "Code", "color": "#13c2c2", "version": "2.1.0",
        "author": {"name": "Ydsz"}, "category": "DEV",
        "tags": ["代码", "审查", "重构"], "rating": 4.9, "downloads": 12300,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/code-reviewer",
        "updated_at": "2026-10-25T13:30:00Z",
        "metadata": {"quick_prompts": ["审查这段代码", "寻找性能瓶颈"]},
    },
    {
        "market_id": "demo-expert-003", "type": "expert", "source": "community",
        "identity": "data-scientist", "name": "数据科学家",
        "description": "端到端数据分析：清洗 → 建模 → 可视化，输出可复现的 Jupyter Notebook。",
        "icon_url": None, "icon_name": "LineChart", "color": "#722ed1", "version": "1.0.8",
        "author": {"name": "AI Lab"}, "category": "DATA",
        "tags": ["数据科学", "建模", "可视化"], "rating": 4.7, "downloads": 6780,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/data-scientist",
        "updated_at": "2026-10-18T10:00:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-plugin-001", "type": "plugin", "source": "builtin",
        "identity": "push-notifier", "name": "企业消息推送",
        "description": "统一推送通道：企业微信 / 钉钉 / 飞书 / 邮件，支持模板与定时任务。",
        "icon_url": None, "icon_name": "Bell", "color": "#eb2f96", "version": "1.0.0",
        "author": {"name": "Ydsz"}, "category": "NOTIFY",
        "tags": ["推送", "通知", "IM"], "rating": 4.3, "downloads": 2890,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/push-notifier",
        "updated_at": "2026-08-15T09:00:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-plugin-002", "type": "plugin", "source": "community",
        "identity": "calendar-sync", "name": "日历同步助手",
        "description": "双向同步 Google Calendar / 飞书日历 / Outlook，智能提醒与冲突检测。",
        "icon_url": None, "icon_name": "Calendar", "color": "#fa8c16", "version": "1.2.0",
        "author": {"name": "Ydsz"}, "category": "PRODUCTIVITY",
        "tags": ["日历", "同步", "提醒"], "rating": 4.4, "downloads": 3670,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/calendar-sync",
        "updated_at": "2026-10-05T15:20:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-connector-001", "type": "connector", "source": "builtin",
        "identity": "google-drive", "name": "Google Drive 连接器",
        "description": "连接 Google Drive，自动同步云端文件到本地知识库，增量更新。",
        "icon_url": None, "icon_name": "Cloud", "color": "#1677ff", "version": "1.4.0",
        "author": {"name": "Ydsz"}, "category": "STORAGE",
        "tags": ["Google", "云盘", "同步"], "rating": 4.6, "downloads": 12400,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/google-drive-connector",
        "updated_at": "2026-10-20T08:30:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-connector-002", "type": "connector", "source": "community",
        "identity": "feishu-docs", "name": "飞书文档同步",
        "description": "双向同步飞书云文档，支持多人协作 + 版本管理 + 变更通知。",
        "icon_url": None, "icon_name": "File", "color": "#13c2c2", "version": "1.0.2",
        "author": {"name": "FeishuDev"}, "category": "COLLAB",
        "tags": ["飞书", "协作", "同步"], "rating": 4.4, "downloads": 7650,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/feishu-docs-connector",
        "updated_at": "2026-09-22T14:00:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-connector-003", "type": "connector", "source": "community",
        "identity": "slack-im", "name": "Slack 消息接入",
        "description": "接入 Slack 工作区，实时监听频道消息，触发 AI 助手自动响应。",
        "icon_url": None, "icon_name": "MessageSquare", "color": "#722ed1", "version": "1.2.1",
        "author": {"name": "Ydsz"}, "category": "IM",
        "tags": ["Slack", "IM", "消息"], "rating": 4.2, "downloads": 3420,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/slack-connector",
        "updated_at": "2026-09-10T11:15:00Z",
        "metadata": {},
    },
    {
        "market_id": "demo-connector-004", "type": "connector", "source": "builtin",
        "identity": "notion-db", "name": "Notion 数据库集成",
        "description": "读写 Notion 数据库，实现双向数据同步，支持多视图过滤与自动化工作流。",
        "icon_url": None, "icon_name": "Database", "color": "#262626", "version": "1.1.0",
        "author": {"name": "Ydsz"}, "category": "COLLAB",
        "tags": ["Notion", "数据库", "同步"], "rating": 4.5, "downloads": 5230,
        "installed": False, "installed_version": None, "has_update": False,
        "source_url": "https://github.com/example/notion-connector",
        "updated_at": "2026-10-08T16:40:00Z",
        "metadata": {},
    },
]


def _demo_items_for_type(item_type: str) -> list[dict[str, Any]]:
    return [i for i in _DEMO_ITEMS if i["type"] == item_type]


def _merge_with_demo(
    result: dict[str, Any], item_type: str, *, category: str | None, query: str | None,
) -> dict[str, Any]:
    existing = result.get("items", [])
    if existing:
        return result
    demo = _demo_items_for_type(item_type)
    if category:
        demo = [d for d in demo if d.get("category") == category]
    if query:
        ql = query.lower()
        demo = [
            d for d in demo
            if ql in d.get("name", "").lower()
            or ql in d.get("description", "").lower()
            or any(ql in t.lower() for t in d.get("tags", ()))
        ]
    return {
        "items": demo[: result.get("limit", len(demo))],
        "total": len(demo),
        "limit": result.get("limit", 20),
        "offset": result.get("offset", 0),
        "sort": result.get("sort", "relevance"),
        "category": category,
        "type": item_type,
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

        raw = await mgr.search(
            q,
            type_filter,
            category=category,
            sort=sort,
            limit=_resolve_limit(limit),
            offset=offset,
            locale=locale,
        )

        # Supplement with demo items when SkillHub returns nothing
        items = raw.get("items", [])
        per_type = raw.get("per_type") or {}
        if not items and not any(per_type.values()):
            demo = _DEMO_ITEMS
            if q:
                ql = q.lower()
                demo = [d for d in demo if ql in d.get("name","").lower() or ql in d.get("description","").lower() or any(ql in t.lower() for t in d.get("tags",()))]
            if type_filter:
                demo = [d for d in demo if d["type"] in type_filter]
            return {
                "items": demo[:limit],
                "total": len(demo),
                "limit": limit,
                "offset": offset,
                "sort": sort,
                "category": category,
                "type": None,
                "query": q,
            }
        return raw

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

        try:
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

                raw = {
                    "items": [_item_to_dict(i) for i in result.items],
                    "total": result.total,
                    "limit": result.limit,
                    "offset": result.offset,
                    "sort": result.sort,
                    "category": result.category,
                    "type": t,
                }
            else:
                raw = await mgr.browse(
                    t,
                    category=category,
                    sort=sort,
                    limit=_resolve_limit(limit),
                    offset=offset,
                    locale=locale,
                )
        except Exception as exc:  # noqa: BLE001
            logger.warning("provider %s failed, using demo fallback: %s", t, exc)
            raw = {"items": [], "total": 0, "limit": _resolve_limit(limit), "offset": offset, "sort": sort, "category": category, "type": t}

        return _merge_with_demo(raw, t, category=category, query=q or None)

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
