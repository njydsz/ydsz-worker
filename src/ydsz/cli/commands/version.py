"""ydsz-worker version command."""

from __future__ import annotations

import click

from ydsz.version import app_version


@click.command("version")
def version() -> None:
    """Show the installed ydsz-worker version."""
    click.echo(f"ydsz-worker v{app_version()}")
