"""Regenerate the bundled skill-market seed snapshot.

Pulls the head of the Qoder catalogue and writes **metadata only** into
``src/ydsz/infra/skills/seed_catalog.json``. Skill bodies are deliberately not
stored: every entry is authored upstream (mostly in public GitHub repos under
licences we cannot re-license), so shipping their content inside our wheel
would be redistribution we are not entitled to do. The seed exists so a fresh
install can *show* a populated marketplace offline; installing an entry fetches
its package from the marketplace at that moment.

    uv run python scripts/refresh_seed_catalog.py
    uv run python scripts/refresh_seed_catalog.py --limit 120 --out path.json
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

_REPO_ROOT = Path(__file__).resolve().parents[1]
_DEFAULT_OUT = _REPO_ROOT / "src" / "ydsz" / "infra" / "skills" / "seed_catalog.json"

# The public API caps page_size well above this, but the catalogue's default
# order is only roughly heat-sorted, so we scan a fixed window and sort locally.
_SCAN_SIZE = 200

# Fields kept in the snapshot. Anything the UI cannot render is dropped so the
# bundled file stays small and reviewable in a diff.
_KEPT_FIELDS = (
    "slug",
    "name",
    "display_name_zh",
    "display_name_en",
    "description",
    "description_zh",
    "description_en",
    "version",
    "author",
    "category",
    "installs",
    "created_at",
    "tags",
)


def _compact(row: dict[str, Any]) -> dict[str, Any]:
    entry = {field: row.get(field) for field in _KEPT_FIELDS}
    entry["source"] = "qoder"
    return entry


def build_snapshot(rows: list[dict[str, Any]], *, limit: int) -> dict[str, Any]:
    """Sort by install count and keep the requested head of the catalogue."""
    ordered = sorted(rows, key=lambda row: row.get("installs") or 0, reverse=True)
    kept = ordered[: max(1, limit)]
    return {
        "version": 1,
        "generated_at": datetime.now(UTC).strftime("%Y-%m-%d"),
        "origin": "qoder",
        "notice": (
            "Metadata only. Skill content is authored upstream and fetched from "
            "the marketplace at install time."
        ),
        "skills": [_compact(row) for row in kept],
    }


def _parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--limit",
        type=int,
        default=80,
        help="how many top-installed skills to keep (default: 80)",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=_DEFAULT_OUT,
        help=f"output path (default: {_DEFAULT_OUT})",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = _parse_args(sys.argv[1:] if argv is None else argv)
    if args.limit > _SCAN_SIZE:
        # The catalogue is fetched one page at a time; silently returning
        # fewer rows than asked for would make a refreshed snapshot look
        # complete when it is not.
        print(
            f"error: --limit cannot exceed {_SCAN_SIZE} (one catalogue page)",
            file=sys.stderr,
        )
        return 1

    from ydsz.infra.skills.qoder_market import search_qoder_skills

    rows = asyncio.run(search_qoder_skills("", limit=_SCAN_SIZE))
    if not rows:
        print("error: the catalogue returned no rows", file=sys.stderr)
        return 1

    snapshot = build_snapshot(rows, limit=args.limit)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(
        json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(
        f"wrote {len(snapshot['skills'])} skills to {args.out} "
        f"(scanned {len(rows)}, generated {snapshot['generated_at']})"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
