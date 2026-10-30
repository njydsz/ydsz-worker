"""Observability configuration API (admin)."""

from __future__ import annotations

from typing import Any, cast

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ydsz.api.deps import get_server, require_permission

router = APIRouter()


class LangfuseConfigResponse(BaseModel):
    enabled: bool
    public_key: str
    host: str
    secret_key_set: bool
    configured: bool


class LangfuseConfigBody(BaseModel):
    enabled: bool = False
    public_key: str = ""
    host: str = Field(
        default="", description="Langfuse server URL, e.g. https://cloud.langfuse.com"
    )
    secret_key: str | None = Field(
        default=None,
        description="Omit to keep the existing secret key unchanged.",
    )


class LangfuseTestBody(BaseModel):
    public_key: str | None = None
    host: str | None = None
    secret_key: str | None = None


def _to_response(cfg: Any) -> LangfuseConfigResponse:
    return LangfuseConfigResponse(
        enabled=cfg.enabled,
        public_key=cfg.public_key,
        host=cfg.host,
        secret_key_set=cfg.secret_key_set,
        configured=cfg.configured,
    )


@router.get("/langfuse", summary="Get Langfuse observability config")
async def get_langfuse_config(
    _: Any = Depends(require_permission("observability")),
    server: Any = Depends(get_server),
) -> LangfuseConfigResponse:
    return _to_response(server.app_runtime.agent_registry.langfuse.load())


@router.put("/langfuse", summary="Update Langfuse observability config")
async def put_langfuse_config(
    body: LangfuseConfigBody,
    _: Any = Depends(require_permission("observability")),
    server: Any = Depends(get_server),
) -> LangfuseConfigResponse:
    cfg = server.app_runtime.agent_registry.save_langfuse(
        enabled=body.enabled,
        public_key=body.public_key,
        host=body.host,
        secret_key=body.secret_key,
    )
    return _to_response(cfg)


@router.post("/langfuse/test", summary="Test Langfuse connection")
async def test_langfuse_connection(
    body: LangfuseTestBody,
    _: Any = Depends(require_permission("observability")),
    server: Any = Depends(get_server),
) -> dict[str, Any]:
    return cast(
        dict[str, Any],
        await server.app_runtime.agent_registry.langfuse.test_connection(
            public_key=body.public_key,
            host=body.host,
            secret_key=body.secret_key,
        ),
    )


# ---------------------------------------------------------------------------
# Dashboard metrics — full Metrics snapshot + agent health
# ---------------------------------------------------------------------------


class AgentMetricsResponse(BaseModel):
    """Aggregate counters for the dashboard system-health panel."""

    agent_active: int
    agent_boots_total: int
    agent_boot_errors_total: int
    agent_reloads_total: int
    agent_start_p50_ms: float
    llm_calls_total: int
    llm_errors_total: int
    llm_tokens_in_total: int
    llm_tokens_out_total: int
    llm_latency_avg_ms: float
    stream_errors_total: int
    stream_sse_connections: int
    stream_sse_bytes_total: int
    tool_calls_total: int
    tool_errors_total: int
    tool_latency_avg_ms: float
    cron_runs_total: int
    cron_errors_total: int
    channel_messages_total: int
    knowledge_docs_indexed_total: int
    knowledge_index_errors_total: int
    provider_circuit_opens_total: int


class AgentHealthEntry(BaseModel):
    """Per-agent live state (for per-agent health inspection)."""

    agent_id: str
    active: bool
    display_name: str
    owner: str | None
    model: str | None


class FullMetricsResponse(BaseModel):
    counters: AgentMetricsResponse
    agents: list[AgentHealthEntry]


@router.get("/metrics/agents", summary="Dashboard metrics: counters + agent health")
async def get_agent_metrics(
    _: Any = Depends(require_permission("observability")),
    server: Any = Depends(get_server),
) -> FullMetricsResponse:
    """Return aggregate counters and per-agent live state for the admin dashboard."""
    from ydsz.infra.metrics import METRICS

    snap = METRICS.snapshot()
    counters = AgentMetricsResponse(
        agent_active=snap["agent_active"],
        agent_boots_total=snap["agent_boots_total"],
        agent_boot_errors_total=snap["agent_boot_errors_total"],
        agent_reloads_total=snap["agent_reloads_total"],
        agent_start_p50_ms=METRICS.avg_ms("agent_start"),
        llm_calls_total=snap["llm_calls_total"],
        llm_errors_total=snap["llm_errors_total"],
        llm_tokens_in_total=snap["llm_tokens_in_total"],
        llm_tokens_out_total=snap["llm_tokens_out_total"],
        llm_latency_avg_ms=METRICS.avg_ms("llm_latency"),
        stream_errors_total=snap["stream_errors_total"],
        stream_sse_connections=snap["stream_sse_connections"],
        stream_sse_bytes_total=snap["stream_sse_bytes_total"],
        tool_calls_total=snap["tool_calls_total"],
        tool_errors_total=snap["tool_errors_total"],
        tool_latency_avg_ms=METRICS.avg_ms("tool_latency"),
        cron_runs_total=snap["cron_runs_total"],
        cron_errors_total=snap["cron_errors_total"],
        channel_messages_total=snap["channel_messages_total"],
        knowledge_docs_indexed_total=snap["knowledge_docs_indexed_total"],
        knowledge_index_errors_total=snap["knowledge_index_errors_total"],
        provider_circuit_opens_total=snap["provider_circuit_opens_total"],
    )
    registry = server.app_runtime.agent_registry
    agents: list[AgentHealthEntry] = []
    for row in registry.list_rows():
        agents.append(
            AgentHealthEntry(
                agent_id=row.agent_id,
                active=registry.is_agent_active(row.agent_id),
                display_name=row.name or row.agent_id,
                owner=registry._owner_username(row)
                if hasattr(registry, "_owner_username")
                else None,
                model=row.default_model or None,
            )
        )
    return FullMetricsResponse(counters=counters, agents=agents)


@router.get("/metrics/prometheus", summary="Prometheus-compatible metrics scraping endpoint")
async def get_prometheus_metrics(
    server: Any = Depends(get_server),
) -> Any:
    """Expose counters in Prometheus ``text/plain`` exposition format.

    No auth — inside-firewall only. Point Prometheus at ``/api/observability/metrics/prometheus``.
    Content-Type follows the Prometheus exposition spec.
    """
    from fastapi.responses import PlainTextResponse

    from ydsz.infra.metrics import METRICS

    snap = METRICS.snapshot()
    lines: list[str] = []
    for key, value in snap.items():
        doc = _PROMETHEUS_DOCS.get(key, "")
        if doc:
            lines.append(f"# HELP {key} {doc}")
        lines.append(f"# TYPE {key} counter")
        lines.append(f"{key} {value}")
        lines.append("")
    return PlainTextResponse(
        content="\n".join(lines),
        media_type="text/plain; version=0.0.4; charset=utf-8",
    )


_PROMETHEUS_DOCS: dict[str, str] = {
    "agent_active": "Currently active (loaded into harness) agents",
    "agent_boots_total": "Total agent boot attempts",
    "agent_boot_errors_total": "Agent boot failures",
    "agent_reloads_total": "Hot-reload invocations",
    "messages_total": "Messages processed",
    "messages_assistant_total": "Assistant messages produced",
    "llm_calls_total": "LLM invoke calls",
    "llm_errors_total": "LLM invoke errors",
    "llm_tokens_in_total": "Input tokens consumed",
    "llm_tokens_out_total": "Output tokens consumed",
    "stream_errors_total": "Streaming errors",
    "stream_sse_connections": "Active SSE connections",
    "stream_sse_bytes_total": "SSE bytes sent",
    "tool_calls_total": "Tool invocations",
    "tool_errors_total": "Tool invocation errors",
    "cron_runs_total": "Cron job executions",
    "cron_errors_total": "Cron job errors",
    "channel_messages_total": "Messages arriving from IM channels",
    "knowledge_docs_indexed_total": "Knowledge documents indexed",
    "knowledge_index_errors_total": "Knowledge indexing failures",
    "provider_circuit_opens_total": "Provider circuit breaker opens",
}
