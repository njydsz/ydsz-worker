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
    agent_reloads_total: int = 0
    agent_start_ms_total: int = 0
    agent_start_ms_count: int = 0

    # ── Messaging ───────────────────────────────────────────────────────
    messages_total: int = 0
    messages_assistant_total: int = 0

    # ── LLM calls ───────────────────────────────────────────────────────
    llm_calls_total: int = 0
    llm_errors_total: int = 0
    llm_tokens_in_total: int = 0
    llm_tokens_out_total: int = 0
    llm_latency_ms_total: int = 0
    llm_latency_ms_count: int = 0

    # ── Streaming ───────────────────────────────────────────────────────
    stream_errors_total: int = 0
    stream_sse_connections: int = 0
    stream_sse_bytes_total: int = 0

    # ── Tool calls ──────────────────────────────────────────────────────
    tool_calls_total: int = 0
    tool_errors_total: int = 0
    tool_latency_ms_total: int = 0
    tool_latency_ms_count: int = 0

    # ── Cron / scheduling ───────────────────────────────────────────────
    cron_runs_total: int = 0
    cron_errors_total: int = 0

    # ── Channel / gateway ───────────────────────────────────────────────
    channel_messages_total: int = 0

    # ── Knowledge ───────────────────────────────────────────────────────
    knowledge_docs_indexed_total: int = 0
    knowledge_index_errors_total: int = 0

    # ── Provider health ────────────────────────────────────────────────
    provider_circuit_opens_total: int = 0

    _lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    def observe(self, name: str, value: int) -> None:
        """Record a latency / size observation (increments *name*_total and *name*_count)."""
        total_key = f"{name}_total"
        count_key = f"{name}_count"
        with self._lock:
            setattr(self, total_key, getattr(self, total_key) + value)
            setattr(self, count_key, getattr(self, count_key) + 1)

    def avg_ms(self, name: str) -> float:
        """Return the average latency in ms for *name*, or 0.0 if no samples."""
        total_key = f"{name}_total"
        count_key = f"{name}_count"
        with self._lock:
            count = getattr(self, count_key)
            if count == 0:
                return 0.0
            return getattr(self, total_key) / count

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
