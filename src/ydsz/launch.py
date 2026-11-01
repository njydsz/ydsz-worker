"""Composition root — wire YdszServer, FastAPI, and uvicorn for ``ydsz-worker run``."""

from __future__ import annotations

import asyncio
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


async def run_market_foreground(
    *,
    host: str | None = None,
    port: int | None = None,
    log_level: str | None = None,
    dashboard_url: str = "",
    cors_origins: list[str] | None = None,
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
