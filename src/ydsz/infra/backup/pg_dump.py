"""PostgreSQL dump/restore via client tools on PATH."""

from __future__ import annotations

import shutil
import subprocess
from collections.abc import Sequence
from pathlib import Path

from ydsz.infra.errors import ErrorCode, YdszError

# Default 30-minute timeout for pg_dump/pg_restore; large DBs may need longer but
# an unbounded run typically indicates a hung network or locked table.
_PG_DUMP_TIMEOUT = 30 * 60  # seconds


def _require_tool(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise YdszError(
            ErrorCode.INTERNAL_ERROR,
            f"{name} not found on PATH; required for PostgreSQL backup/restore",
        )
    return path


def dump_postgres(
    conninfo: str,
    dest: Path,
    *,
    exclude_table_data: Sequence[str] = (),
) -> None:
    pg_dump = _require_tool("pg_dump")
    dest.parent.mkdir(parents=True, exist_ok=True)
    cmd = [pg_dump, "-Fc", "-f", str(dest), "--dbname", conninfo]
    for table in exclude_table_data:
        cmd.extend(["--exclude-table-data", table])
    try:
        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=False,
            timeout=_PG_DUMP_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        raise YdszError(
            ErrorCode.INTERNAL_ERROR,
            f"pg_dump timed out after {_PG_DUMP_TIMEOUT}s (large DB or network hang)",
        ) from None
    if proc.returncode != 0:
        raise YdszError(
            ErrorCode.INTERNAL_ERROR,
            f"pg_dump failed: {proc.stderr.strip() or proc.stdout.strip()}",
        )


def restore_postgres(conninfo: str, dump_file: Path) -> None:
    pg_restore = _require_tool("pg_restore")
    try:
        proc = subprocess.run(
            [
                pg_restore,
                "--clean",
                "--if-exists",
                "--no-owner",
                "--dbname",
                conninfo,
                str(dump_file),
            ],
            capture_output=True,
            text=True,
            check=False,
            timeout=_PG_DUMP_TIMEOUT,
        )
    except subprocess.TimeoutExpired:
        raise YdszError(
            ErrorCode.INTERNAL_ERROR,
            f"pg_restore timed out after {_PG_DUMP_TIMEOUT}s (large DB or network hang)",
        ) from None
    # pg_restore may return 1 with warnings; treat only >=2 as hard fail.
    if proc.returncode >= 2:
        raise YdszError(
            ErrorCode.INTERNAL_ERROR,
            f"pg_restore failed: {proc.stderr.strip() or proc.stdout.strip()}",
        )
