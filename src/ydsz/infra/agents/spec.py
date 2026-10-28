"""Agent creation spec and validation — extracted from agents/manager.py."""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Any

from ydsz.infra.errors import ErrorCode, YdszError

# Custom agent ids become workspace directory names (~/.ydsz-worker/agents/<id>/),
# so restrict to a conservative slug charset — no separators, dots, or
# unicode — to keep every downstream path/URL usage safe.
_CUSTOM_AGENT_ID_RE = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9_-]{1,62}[a-zA-Z0-9]$")

# Lowercase names that would collide with workspace-adjacent directories or
# well-known URL/route segments.
_RESERVED_AGENT_IDS = frozenset({"api", "admin", "agents", "experts"})


def validate_custom_agent_id(agent_id: str) -> str:
    """Validate a user-supplied agent id; raise ``YdszError`` when invalid."""
    if not _CUSTOM_AGENT_ID_RE.fullmatch(agent_id):
        raise YdszError(
            ErrorCode.AGENT_ID_INVALID,
            "agent id must be 3-64 chars of letters/digits/underscore/hyphen, "
            "starting and ending with a letter or digit",
        )
    lowered = agent_id.lower()
    if lowered in _RESERVED_AGENT_IDS:
        raise YdszError(ErrorCode.AGENT_ID_INVALID, f"agent id {agent_id!r} is reserved")
    return agent_id


@dataclass
class AgentCreateSpec:
    """Input for :meth:`AgentManager.create`."""

    name: str
    agent_id: str | None = None
    user_id: int | None = None
    description: str | None = None
    persona_mbti: str | None = None
    default_model: str | None = None
    system_prompt: str | None = None
    icon: str | None = None
    template_name: str | None = None
    is_shared: bool = False
    icon_name: str | None = None
    icon_url: str | None = None
    color: str | None = None
    skill_package_ids: list[str] | None = None
    published_expert_id: str | None = None
    welcome_message: str | None = None
    knowledge_base_ids: list[str] | None = None
    mcp_servers: list[str] | None = None
    runtime_config: dict[str, Any] = field(default_factory=dict)
    config: dict[str, Any] = field(default_factory=dict)
    kind: str = "expert"
    member_ids: list[str] = field(default_factory=list)


def _sanitize_bound_mcp_tools(agent: Any) -> None:
    """Clamp MCP tool names already bound on *agent* to the 64-char LLM limit."""
    from ydsz.infra.agents.plugins.plugin_tool_names import sanitize_plugin_tool_names

    tools = list(getattr(agent, "_mcp_tools", []) or [])
    if not tools:
        return
    before = [str(getattr(t, "name", "")) for t in tools]
    sanitize_plugin_tool_names(tools)
    if before != [str(getattr(t, "name", "")) for t in tools]:
        agent.replace_mcp_tools(tools)
