"""SSE / WebSocket frame formatting helpers.

Provides frame formatting with keep-alive comments, Last-Event-Id support, and
reconnection retry hints for long-lived agent streams.
"""

from __future__ import annotations

import json
import time
from typing import Any

# SSE comment line sent every N seconds to keep proxies / load balancers from
# timing out idle text/event-stream connections (nginx default is 60s).
DEFAULT_SSE_KEEPALIVE_INTERVAL_S = 25
# Suggested client retry interval in milliseconds (sent in SSE ``retry:`` field).
DEFAULT_SRETRY_MS = 3000


def json_chunk_default(obj: Any) -> Any:
    """Fallback serializer for types json.dumps can't handle natively."""
    if hasattr(obj, "model_dump"):
        try:
            return obj.model_dump()
        except Exception:
            pass
    if hasattr(obj, "dict"):
        try:
            return obj.dict()
        except Exception:
            pass
    return repr(obj)


def format_sse(event: str, data: Any) -> str:
    """Format a single SSE event frame with JSON payload."""
    if isinstance(data, str):
        payload = data
    else:
        try:
            payload = json.dumps(data, ensure_ascii=False, default=json_chunk_default)
        except Exception:
            payload = json.dumps({"type": "error", "message": "chunk not serializable"})
    return f"event: {event}\ndata: {payload}\n\n"


def format_sse_with_id(event: str, data: Any, event_id: str | None = None) -> str:
    """Format an SSE event with an explicit ``id:`` field for replay after reconnect."""
    if isinstance(data, str):
        payload = data
    else:
        try:
            payload = json.dumps(data, ensure_ascii=False, default=json_chunk_default)
        except Exception:
            payload = json.dumps({"type": "error", "message": "chunk not serializable"})
    id_line = f"id: {event_id}\n" if event_id else ""
    return f"{id_line}event: {event}\ndata: {payload}\n\n"


def format_sse_keepalive() -> str:
    """Return an SSE comment line that nudges idle-proxy timeouts without being an event.

    Some proxies treat any line starting with ``:`` as a no-op ping. We add a
    stable ``ts:`` field so testers can assert periodicity if needed.
    """
    return f": keep-alive ts={int(time.time())}\n"


def format_sse_retry(ms: int = DEFAULT_SRETRY_MS) -> str:
    """Return an SSE ``retry:`` hint to standardize client backoff."""
    return f"retry: {ms}\n"
