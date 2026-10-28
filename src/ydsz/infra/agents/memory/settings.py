"""Memory-related agent config helpers — extracted from agents/manager.py.

Shared by AgentManager and the ``/api/agents/{id}/memory`` HTTP surface.
"""

from __future__ import annotations

import logging
from collections.abc import Callable
from dataclasses import fields
from typing import Any

from ydsz_harness import HarnessAgentConfig

logger = logging.getLogger(__name__)

# ydsz-memory builds SQLite table names as ``{namespace}_*``. The namespace
# must be a valid bare SQL identifier: start with a letter, only [A-Za-z0-9_].
_MEMORY_NS_PREFIX = "agent_"

_HARNESS_AGENT_CONFIG_FIELDS = frozenset(item.name for item in fields(HarnessAgentConfig))


def _memory_namespace(agent_id: str) -> str:
    return f"{_MEMORY_NS_PREFIX}{agent_id}"


def _memory_aux_model_settings(
    mem: dict[str, Any],
    supported_fields: frozenset[str],
    is_ref_usable: Callable[[str], bool] | None,
) -> dict[str, Any]:
    """Map the ``memory.aux_model`` ref onto both harness extraction tiers.

    A stale ref (provider deleted / model disabled since it was saved) is
    dropped with a warning so extraction falls back to the default model
    instead of failing at call time.
    """
    aux_model = mem.get("aux_model")
    if (
        not isinstance(aux_model, str)
        or not aux_model.strip()
        or "memory_aux_light_model" not in supported_fields
        or "memory_aux_heavy_model" not in supported_fields
    ):
        return {}
    ref = aux_model.strip()
    if is_ref_usable is not None and not is_ref_usable(ref):
        logger.warning(
            "memory aux_model %r no longer usable; falling back to the default model",
            ref,
        )
        return {}
    # One user-chosen model drives both extraction tiers.
    return {"memory_aux_light_model": ref, "memory_aux_heavy_model": ref}


def memory_extract_supported_options() -> list[str]:
    """Call options supported by the installed harness, for the settings UI."""
    fields = {
        "extract_max_tokens": "memory_extract_max_tokens",
        "extract_light_timeout_s": "memory_aux_light_timeout_s",
        "extract_heavy_timeout_s": "memory_aux_heavy_timeout_s",
        "extract_thinking": "memory_aux_thinking",
        "extract_extra_body": "memory_aux_extra_body",
        "extract_max_retries": "memory_aux_max_retries",
        "extract_retry_backoff_s": "memory_aux_retry_backoff_s",
    }
    return [key for key, field in fields.items() if field in _HARNESS_AGENT_CONFIG_FIELDS]


def _memory_extract_settings(
    cfg: dict[str, Any],
    *,
    supported_fields: frozenset[str] = _HARNESS_AGENT_CONFIG_FIELDS,
    is_ref_usable: Callable[[str], bool] | None = None,
) -> dict[str, Any]:
    """Extract the ``memory`` config section into HarnessAgentConfig kwargs.

    Mirrors the shape written by the dashboard's ``PUT .../memory/extract-config``
    endpoint. Only recognized keys are forwarded; anything missing falls through
    to HarnessAgentConfig's own defaults, so an agent with no ``memory`` section
    behaves exactly as before.
    """
    mem = cfg.get("memory")
    if not isinstance(mem, dict):
        return {}
    out: dict[str, Any] = _memory_aux_model_settings(mem, supported_fields, is_ref_usable)
    if "memory_enabled" in supported_fields and isinstance(mem.get("memory_enabled"), bool):
        out["memory_enabled"] = mem["memory_enabled"]
    if "memory_extract_on_session_end" in supported_fields and isinstance(
        mem.get("extract_on_session_end"), bool
    ):
        out["memory_extract_on_session_end"] = mem["extract_on_session_end"]
    mode = mem.get("extract_trigger_mode")
    if mode in ("idle", "interval") and "memory_extract_trigger_mode" in supported_fields:
        out["memory_extract_trigger_mode"] = mode
    for src, dst in (
        ("extract_idle_seconds", "memory_extract_idle_seconds"),
        ("extract_interval_seconds", "memory_extract_interval_seconds"),
    ):
        val = mem.get(src)
        if (
            dst in supported_fields
            and isinstance(val, int | float)
            and not isinstance(val, bool)
            and val > 0
        ):
            out[dst] = float(val)

    # Aux-call options (#1360): read timeouts per tier, an extraction output
    # budget, and vendor request extras for the aux LLM. Forward-compat: only
    # forwarded when the installed ydsz-harness knows the field.
    for src, dst in (
        ("extract_light_timeout_s", "memory_aux_light_timeout_s"),
        ("extract_heavy_timeout_s", "memory_aux_heavy_timeout_s"),
    ):
        val = mem.get(src)
        if (
            dst in supported_fields
            and isinstance(val, int | float)
            and not isinstance(val, bool)
            and val > 0
        ):
            # Older API versions accepted timeouts beyond harness limits.
            out[dst] = max(30.0, min(3600.0, float(val)))
    max_tokens = mem.get("extract_max_tokens")
    if (
        "memory_extract_max_tokens" in supported_fields
        and isinstance(max_tokens, int)
        and not isinstance(max_tokens, bool)
        and max_tokens > 0
    ):
        out["memory_extract_max_tokens"] = max(128, min(65536, max_tokens))
    thinking = mem.get("extract_thinking")
    if thinking in ("auto", "off", "on") and "memory_aux_thinking" in supported_fields:
        out["memory_aux_thinking"] = thinking
    for src, dst in (
        ("extract_max_retries", "memory_aux_max_retries"),
        ("extract_retry_backoff_s", "memory_aux_retry_backoff_s"),
    ):
        value = mem.get(src)
        if (
            dst in supported_fields
            and isinstance(value, int | float)
            and not isinstance(value, bool)
        ):
            out[dst] = value
    extra_body = mem.get("extract_extra_body")
    aux_model = mem.get("aux_model")
    has_aux_override = isinstance(aux_model, str) and bool(aux_model.strip())
    if (
        "memory_aux_extra_body" in supported_fields
        and isinstance(extra_body, dict)
        and extra_body
        and (not has_aux_override or "memory_aux_light_model" in out)
    ):
        out["memory_aux_extra_body"] = dict(extra_body)

    # ydsz-harness 0.9.5 predates the interval trigger fields. Keep
    # hot reload working against that release and approximate interval mode
    # with its per-session idle watchdog until a newer harness is installed.
    if (
        mode == "interval"
        and "memory_extract_trigger_mode" not in supported_fields
        and "memory_extract_idle_seconds" in supported_fields
    ):
        interval = mem.get("extract_interval_seconds")
        if isinstance(interval, int | float) and not isinstance(interval, bool) and interval > 0:
            out["memory_extract_idle_seconds"] = float(interval)
        logger.warning(
            "Installed ydsz-harness lacks interval memory extraction; "
            "falling back to the idle watchdog for this agent"
        )
    return out
