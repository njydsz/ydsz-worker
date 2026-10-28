"""In-memory metrics counters and gauges.

Counters (monotonically increasing): ``inc()``.
Gauges (arbitrary values): ``set()``.
Snapshot: :meth:`Metrics.snapshot` returns all fields.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field, fields


@dataclass
class Metrics:
    # ── Agent lifecycle ─────────────────────────────────────────────────
    agent_active: int = 0
    agent_boots_total: int = 0
    agent_boot_errors_total: int = 0

    # ── Messaging ───────────────────────────────────────────────────────
    messages_total: int = 0
    messages_assistant_total: int = 0

    # ── LLM calls ───────────────────────────────────────────────────────
    llm_calls_total: int = 0
    llm_errors_total: int = 0

    # ── Streaming ───────────────────────────────────────────────────────
    stream_errors_total: int = 0

    # ── Cron / scheduling ───────────────────────────────────────────────
    cron_runs_total: int = 0
    cron_errors_total: int = 0

    # ── Channel / gateway ───────────────────────────────────────────────
    channel_messages_total: int = 0

    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def inc(self, name: str, n: int = 1) -> None:
        with self._lock:
            setattr(self, name, getattr(self, name) + n)

    def set(self, name: str, value: int) -> None:
        with self._lock:
            setattr(self, name, value)

    def snapshot(self) -> dict[str, int]:
        with self._lock:
            return {
                f.name: getattr(self, f.name) for f in fields(self) if not f.name.startswith("_")
            }


METRICS = Metrics()
