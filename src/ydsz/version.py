"""Single source of truth for the running application version.

The distribution name registered in ``pyproject.toml`` is ``ydsz-worker``
(the console script is ``ydsz-worker``; the import package is ``ydsz``).
Several call sites need the version at runtime — CLI banner, REPL welcome,
MCP handshake, self-update probe — and querying ``importlib.metadata`` with
the wrong name silently yields a placeholder.

Resolve in this order:

1. ``importlib.metadata.version("ydsz-worker")`` — correct when installed as a
   distribution (the normal case for ``ydsz-worker run``).
2. ``ydsz.__version__`` — reliable in editable/dev checkouts and frozen
   contexts (PyInstaller / Tauri) where distribution metadata is absent.
3. ``"0.0.0"`` — sentinel meaning "unknown"; UI should render it as such.
"""

from __future__ import annotations

from importlib.metadata import PackageNotFoundError, version

DISTRIBUTION_NAME = "ydsz-worker"

UNKNOWN_VERSION = "0.0.0"


def app_version() -> str:
    """Return the installed distribution version, falling back to source."""
    try:
        return version(DISTRIBUTION_NAME)
    except PackageNotFoundError:
        pass
    except Exception:
        # Metadata can be present but unreadable (corrupt dist-info, etc.).
        pass

    try:
        from ydsz import __version__

        return __version__
    except Exception:
        return UNKNOWN_VERSION
