"""Composition root — wire YdszServer, FastAPI, and uvicorn for ``ydsz-worker run``."""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from contextlib import suppress
from typing import Any

from ydsz.infra.server import YdszServer
from ydsz.infra.utils.accept_errors import coalesce_accept_errors

logger = logging.getLogger(__name__)


def _ensure_linux_bubblewrap() -> None:
    """Best-effort startup provisioning; never fail the ``ydsz-worker run`` process."""
    try:
        from ydsz.infra.utils.bwrap import ensure_bubblewrap

        result = ensure_bubblewrap()
    except Exception:
        logger.warning("background bubblewrap provisioning failed", exc_info=True)
        return
    status = result.get("status")
    detail = result.get("detail")
    if status == "degraded":
        logger.warning("background bubblewrap provisioning degraded: %s", detail or "unknown")
    else:
        logger.info("background bubblewrap provisioning status=%s", status)


def _schedule_linux_bubblewrap_ensure() -> asyncio.Task[None] | None:
    """Run bubblewrap provisioning once in the background on Linux."""
    if not sys.platform.startswith("linux"):
        return None
    return asyncio.create_task(
        asyncio.to_thread(_ensure_linux_bubblewrap),
        name="ensure-linux-bubblewrap",
    )


async def _cancel_background_task(task: asyncio.Task[None] | None) -> None:
    """Drop a startup background task on shutdown; never raise."""
    if task is None or task.done():
        return
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task


async def _serve(server: Any) -> None:
    await server.serve()


async def run_foreground(
    *,
    host: str | None,
    port: int | None,
    reload: bool,
    workers: int,
    log_level: str | None,
    ssl_certfile: str | None,
    ssl_keyfile: str | None,
) -> None:
    """Boot the domain server, serve the HTTP API, then shut down cleanly."""
    import uvicorn

    from ydsz.api.app import build_app
    from ydsz.infra.bridge.transport import BRIDGE_WS_MAX_BYTES
    from ydsz.infra.setup.tls.http_companion import build_http_companion_app
    from ydsz.infra.setup.tls.listeners import build_listen_plan
    from ydsz.infra.setup.tls.store import resolve_tls_paths

    srv = YdszServer()
    await srv.start()
    bwrap_task = _schedule_linux_bubblewrap_ensure()
    # Greenfield deferral leaves services unset until /setup/database binds.
    cfg = srv.services.config if srv.services is not None else srv.config
    assert cfg is not None
    bind_host = host or cfg.bind_host
    bind_port = port or cfg.port
    if ssl_certfile is None and ssl_keyfile is None:
        ssl_certfile, ssl_keyfile = resolve_tls_paths(srv.paths.root, cfg.tls)

    plan = build_listen_plan(
        cfg,
        bind_host=bind_host,
        bind_port=bind_port,
        ssl_certfile=ssl_certfile,
        ssl_keyfile=ssl_keyfile,
    )
    level = (log_level or cfg.log_level).lower()
    worker_count = 1 if plan.dual_listeners or reload else workers
    if plan.dual_listeners and (reload or workers > 1):
        logger.warning(
            "TLS dual-port mode forces workers=1 and disables reload",
        )
        reload = False

    app = build_app(srv)
    servers: list[uvicorn.Server] = []

    if plan.dual_listeners:
        assert plan.https_port is not None
        assert plan.http_port is not None
        https_config = uvicorn.Config(
            app,
            host=plan.bind_host,
            port=plan.https_port,
            log_level=level,
            workers=worker_count,
            reload=False,
            ssl_certfile=plan.ssl_certfile,
            ssl_keyfile=plan.ssl_keyfile,
            ws_max_size=BRIDGE_WS_MAX_BYTES,
        )
        companion = build_http_companion_app(https_port=plan.https_port)
        http_config = uvicorn.Config(
            companion,
            host=plan.bind_host,
            port=plan.http_port,
            log_level=level,
            workers=1,
            reload=False,
        )
        servers.append(uvicorn.Server(https_config))
        servers.append(uvicorn.Server(http_config))
        logger.info(
            "Listening on https://%s:%s and http://%s:%s (ACME + redirect)",
            plan.bind_host,
            plan.https_port,
            plan.bind_host,
            plan.http_port,
        )
    else:
        single_config = uvicorn.Config(
            app,
            host=plan.bind_host,
            port=plan.http_port or bind_port,
            log_level=level,
            workers=worker_count,
            reload=reload,
            ssl_certfile=plan.ssl_certfile,
            ssl_keyfile=plan.ssl_keyfile,
            ws_max_size=BRIDGE_WS_MAX_BYTES,
        )
        servers.append(uvicorn.Server(single_config))

    from ydsz.infra.agents.memory.slim_control import MemorySlimControl

    memory_control = MemorySlimControl(srv)
    with coalesce_accept_errors(asyncio.get_running_loop()):
        try:
            await memory_control.start()
            await asyncio.gather(*(_serve(s) for s in servers))
        finally:
            await memory_control.close()
            await _cancel_background_task(bwrap_task)
            await srv.stop()


_DEMO_MARKET_ITEMS: list[dict[str, Any]] = [
    # ── Skills ──────────────────────────────────────────────────────────
    {
        "market_id": "demo-skill-001", "item_type": "skill", "source": "community",
        "identity": "web-scraper", "name": "网页抓取工具",
        "description": "智能解析任意网页内容，抽取结构化数据，支持自动翻页和定时抓取。",
        "icon_name": "Globe", "color": "#1677ff", "version": "1.2.0",
        "author": "Ydsz", "category": "PRODUCTIVITY",
        "tags": ["爬虫", "数据采集", "自动化"], "rating": 4.6, "downloads": 5600,
        "source_url": "https://github.com/example/web-scraper",
        "metadata_json": '{"quick_prompts":["抽取页面所有链接","转为Markdown"]}',
    },
    {
        "market_id": "demo-skill-002", "item_type": "skill", "source": "community",
        "identity": "sql-analyzer", "name": "SQL 数据分析",
        "description": "自然语言转 SQL 查询，支持 MySQL / PostgreSQL / SQLite，一键生成可视化报表。",
        "icon_name": "Database", "color": "#722ed1", "version": "2.0.1",
        "author": "DataTeam", "category": "DATA",
        "tags": ["SQL", "数据分析", "可视化"], "rating": 4.8, "downloads": 8230,
        "source_url": "https://github.com/example/sql-analyzer",
        "metadata_json": '{"quick_prompts":["查询销售趋势","生成日报"]}',
    },
    {
        "market_id": "demo-skill-003", "item_type": "skill", "source": "ILTIN",
        "identity": "email-assistant", "name": "邮件智能助手",
        "description": "自动分类收件箱、提取待办、生成回复草稿，支持多邮箱聚合。",
        "icon_name": "Mail", "color": "#fa8c16", "version": "1.0.3",
        "author": "Ydsz", "category": "PRODUCTIVITY",
        "tags": ["邮件", "助理", "分类"], "rating": 4.4, "downloads": 3210,
        "source_url": "https://github.com/example/email-assistant",
        "metadata_json": "{}",
    },
    {
        "market_id": "demo-skill-004", "item_type": "skill", "source": "ILTIN",
        "identity": "pdf-reader", "name": "PDF 语义问答",
        "description": "上传任意 PDF，基于 RAG 进行语义检索式问答，支持批量文档。",
        "icon_name": "FileText", "color": "#52c41a", "version": "1.1.0",
        "author": "Ydsz", "category": "NLP",
        "tags": ["PDF", "RAG", "问答"], "rating": 4.7, "downloads": 6890,
        "source_url": "https://github.com/example/pdf-reader",
        "metadata_json": '{"dependencies":["vectordb"]}',
    },
    # ── Experts ──────────────────────────────────────────────────────────
    {
        "market_id": "demo-expert-001", "item_type": "expert", "source": "community",
        "identity": "excel-master", "name": "Excel 高级分析专家",
        "description": "精通 Excel 公式、VBA、数据透视表，可自动清洗数据并生成分析报告。",
        "icon_name": "Table", "color": "#52c41a", "version": "1.3.0",
        "author": "BizTools", "category": "OFFICE",
        "tags": ["Excel", "报表", "办公"], "rating": 4.5, "downloads": 4520,
        "source_url": "https://github.com/example/excel-master",
        "metadata_json": "{}",
    },
    {
        "market_id": "demo-expert-002", "item_type": "expert", "source": "ILTIN",
        "identity": "code-reviewer", "name": "代码审查官",
        "description": "深度代码审查 + 重构建议，支持 20+ 编程语言，符合企业级编码规范。",
        "icon_name": "Code", "color": "#13c2c2", "version": "2.1.0",
        "author": "Ydsz", "category": "DEV",
        "tags": ["代码", "审查", "重构"], "rating": 4.9, "downloads": 12300,
        "source_url": "https://github.com/example/code-reviewer",
        "metadata_json": '{"quick_prompts":["审查这段代码","寻找性能瓶颈"]}',
    },
    # ── Plugins ──────────────────────────────────────────────────────────
    {
        "market_id": "demo-plugin-001", "item_type": "plugin", "source": "ILTIN",
        "identity": "push-notifier", "name": "企业消息推送",
        "description": "统一推送通道：企业微信 / 钉钉 / 飞书 / 邮件，支持模板与定时任务。",
        "icon_name": "Bell", "color": "#eb2f96", "version": "1.0.0",
        "author": "Ydsz", "category": "NOTIFY",
        "tags": ["推送", "通知", "IM"], "rating": 4.3, "downloads": 2890,
        "source_url": "https://github.com/example/push-notifier",
        "metadata_json": "{}",
    },
    # ── Connectors ───────────────────────────────────────────────────────
    {
        "market_id": "demo-connector-001", "item_type": "connector", "source": "ILTIN",
        "identity": "google-drive", "name": "Google Drive 连接器",
        "description": "连接 Google Drive，自动同步云端文件到本地知识库，增量更新。",
        "icon_name": "Cloud", "color": "#1677ff", "version": "1.4.0",
        "author": "Ydsz", "category": "STORAGE",
        "tags": ["Google", "云盘", "同步"], "rating": 4.6, "downloads": 12400,
        "source_url": "https://github.com/example/google-drive-connector",
        "metadata_json": "{}",
    },
    {
        "market_id": "demo-connector-002", "item_type": "connector", "source": "community",
        "identity": "feishu-docs", "name": "飞书文档同步",
        "description": "双向同步飞书云文档，支持多人协作 + 版本管理 + 变更通知。",
        "icon_name": "File", "color": "#13c2c2", "version": "1.0.2",
        "author": "FeishuDev", "category": "COLLAB",
        "tags": ["飞书", "协作", "同步"], "rating": 4.4, "downloads": 7650,
        "source_url": "https://github.com/example/feishu-docs-connector",
        "metadata_json": "{}",
    },
    {
        "market_id": "demo-connector-003", "item_type": "connector", "source": "community",
        "identity": "slack-im", "name": "Slack 消息接入",
        "description": "接入 Slack 工作区，实时监听频道消息，触发 AI 助手自动响应。",
        "icon_name": "MessageSquare", "color": "#722ed1", "version": "1.2.1",
        "author": "Ydsz", "category": "IM",
        "tags": ["Slack", "IM", "消息"], "rating": 4.2, "downloads": 3420,
        "source_url": "https://github.com/example/slack-connector",
        "metadata_json": "{}",
    },
]


async def _seed_market_demo_if_empty(srv: Any) -> int:
    """Insert demo market items when the market_items table is empty.

    Returns the number of items inserted (0 when table already has data).
    """
    try:
        pool = getattr(srv.services, "db", None) if srv.services else None
        if pool is None:
            return 0

        def _count() -> int:
            with pool.conn() as conn:
                cur = conn.execute("SELECT COUNT(*) FROM market_items")
                return int(cur.fetchone()[0])

        inserted = await asyncio.to_thread(_count)
        if inserted > 0:
            return 0

        def _insert_all() -> int:
            with pool.conn() as conn:
                for item in _DEMO_MARKET_ITEMS:
                    conn.execute(
                        """INSERT OR IGNORE INTO market_items
                           (market_id, item_type, source, identity, name, description,
                            icon_name, color, version, author, category, tags_json,
                            rating, downloads, source_url, metadata_json, refreshed_at)
                           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'))""",
                        (
                            item["market_id"], item["item_type"], item["source"],
                            item["identity"], item["name"], item["description"],
                            item.get("icon_name", ""), item.get("color", ""),
                            item["version"], item["author"], item["category"],
                            json.dumps(item.get("tags", []), ensure_ascii=False),
                            item.get("rating"), item.get("downloads", 0),
                            item.get("source_url", ""), item.get("metadata_json", "{}"),
                        ),
                    )
                conn.commit()
                return len(_DEMO_MARKET_ITEMS)

        n = await asyncio.to_thread(_insert_all)
        if n:
            logger.info("Market standalone: seeded %d demo items", n)
        return n
    except Exception as exc:  # noqa: BLE001
        logger.warning("Market seed failed (non-fatal): %s", exc)
        return 0


async def run_market_foreground(
    *,
    host: str | None = None,
    port: int | None = None,
    log_level: str | None = None,
    dashboard_url: str = "",
    cors_origins: list[str] | None = None,
    seed_demo: bool = True,
) -> None:
    """Boot only the public Marketplace — no JWT, no setup, no dashboard.

    Runs on ``port`` (default 8090) so it can coexist with the main Ydzz
    Worker on 8088.  CORS is configured explicitly because the marketplace
    is meant to be embedded into the official website on a different origin.
    """
    import uvicorn

    from ydsz.api.market_app import build_market_app

    srv = YdszServer()
    await srv.start()

    if seed_demo:
        await _seed_market_demo_if_empty(srv)

    cfg = srv.services.config if srv.services is not None else srv.config
    bind_host = host or "0.0.0.0"
    bind_port = port or 8090
    level = (log_level or (cfg.log_level if cfg else "info")).lower()

    app = build_market_app(srv, dashboard_url=dashboard_url, cors_origins=cors_origins)

    config = uvicorn.Config(
        app,
        host=bind_host,
        port=bind_port,
        log_level=level,
        workers=1,
        reload=False,
    )
    server = uvicorn.Server(config)
    logger.info("Market standalone listening on http://%s:%s", bind_host, bind_port)

    try:
        await server.serve()
    finally:
        await srv.stop()


def run_foreground_blocking(**kwargs: Any) -> None:
    """Sync entry for Click commands and tests."""
    asyncio.run(run_foreground(**kwargs))


def run_market_foreground_blocking(**kwargs: Any) -> None:
    """Sync entry for ``ydsz-worker market``."""
    asyncio.run(run_market_foreground(**kwargs))
