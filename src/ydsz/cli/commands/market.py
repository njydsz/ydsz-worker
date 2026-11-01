"""``ydsz-worker market`` — run the standalone public marketplace."""

from __future__ import annotations

import click

from ydsz.launch import run_market_foreground_blocking


@click.command("market")
@click.option("--host", default=None, help="Bind host (default: 0.0.0.0)")
@click.option("--port", default=None, type=int, help="Bind port (default: 8090)")
@click.option("--log-level", default=None, help="Log level (default: from config)")
@click.option(
    "--dashboard-url",
    default="",
    help="Ydzs Worker dashboard URL for install redirects",
)
@click.option(
    "--cors-origin",
    "cors_origins",
    multiple=True,
    help="Allowed CORS origin (repeatable). Default: same-origin only.",
)
def market(
    host: str | None,
    port: int | None,
    log_level: str | None,
    dashboard_url: str,
    cors_origins: tuple[str, ...],
) -> None:
    """Start the public Ydzz Marketplace web server (no auth required)."""
    run_market_foreground_blocking(
        host=host,
        port=port,
        log_level=log_level,
        dashboard_url=dashboard_url,
        cors_origins=list(cors_origins) if cors_origins else None,
    )
