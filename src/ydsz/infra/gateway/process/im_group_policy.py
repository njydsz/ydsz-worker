"""Group-chat tool policy for external IM members (issue #2396).

IM group members share the agent owner's identity
(``resolve_user_id_for_message`` returns ``agent_owner_id``), so any group
member can drive the same toolset as the owner. Prompt-level "strong memory"
bans cannot be trusted against member instructions, so the policy is enforced
here: the processor stamps a turn-scoped ``conversation_mode`` (harness
middleware filters the tool list *and* blocks tool calls), independent of
what the prompt says.

Agent config keys (``config_json``):

* ``im_group_tool_policy`` — ``inherit`` (default) | ``read_only`` | ``none``.
  ``inherit`` keeps today's behaviour; ``read_only`` forces Ask mode
  (read-only tool allowlist); ``none`` forces Chat mode (no tools at all).
* ``im_group_owner_sender_ids`` — platform sender ids (``metadata.sender_id``)
  that must keep full owner capabilities in group chats, e.g. the owner's own
  ``member_openid``. Empty by default: with a non-``inherit`` policy every
  group sender is treated as a non-owner.
"""

from __future__ import annotations

import json
from typing import Any

GROUP_TOOL_POLICY_KEY = "im_group_tool_policy"
GROUP_OWNER_SENDERS_KEY = "im_group_owner_sender_ids"

GROUP_TOOL_POLICIES: frozenset[str] = frozenset({"inherit", "read_only", "none"})
DEFAULT_GROUP_TOOL_POLICY = "inherit"

# conversation_mode values enforced per policy (see ydsz_harness
# middleware/conversation_mode.py). ``inherit`` maps to None = no override.
_POLICY_MODES: dict[str, str | None] = {
    "inherit": None,
    "read_only": "ask",
    "none": "chat",
}


def parse_group_tool_policy(raw: object) -> str:
    return raw if isinstance(raw, str) and raw in GROUP_TOOL_POLICIES else DEFAULT_GROUP_TOOL_POLICY


def group_tool_policy_from_cfg(cfg: dict[str, Any] | None) -> str:
    return parse_group_tool_policy((cfg or {}).get(GROUP_TOOL_POLICY_KEY))


def owner_sender_ids_from_cfg(cfg: dict[str, Any] | None) -> frozenset[str]:
    raw = (cfg or {}).get(GROUP_OWNER_SENDERS_KEY)
    if not isinstance(raw, list):
        return frozenset()
    return frozenset(str(item).strip() for item in raw if str(item).strip())


def enforced_mode_for_policy(policy: str) -> str | None:
    """Turn-scoped ``conversation_mode`` for *policy*, or ``None`` to inherit."""
    return _POLICY_MODES.get(policy)


def enforced_group_conversation_mode(
    cfg: dict[str, Any] | None,
    *,
    is_group_chat: bool,
    sender_id: object,
) -> str | None:
    """Return the mode to force for this group turn, or ``None``.

    ``None`` means "keep whatever the thread/dashboard resolved" — either the
    chat is not a group chat, the policy is ``inherit``, or the sender is a
    configured owner sender id.
    """
    if not is_group_chat:
        return None
    policy = group_tool_policy_from_cfg(cfg)
    mode = enforced_mode_for_policy(policy)
    if mode is None:
        return None
    owners = owner_sender_ids_from_cfg(cfg)
    sid = str(sender_id or "").strip()
    if owners and sid in owners:
        return None
    return mode


def parse_config_json_safe(raw: str | None) -> dict[str, Any]:
    """Best-effort ``config_json`` parse; malformed JSON yields ``{}``."""
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
    except (TypeError, ValueError):
        return {}
    return parsed if isinstance(parsed, dict) else {}


__all__ = [
    "DEFAULT_GROUP_TOOL_POLICY",
    "GROUP_OWNER_SENDERS_KEY",
    "GROUP_TOOL_POLICIES",
    "GROUP_TOOL_POLICY_KEY",
    "enforced_group_conversation_mode",
    "enforced_mode_for_policy",
    "group_tool_policy_from_cfg",
    "owner_sender_ids_from_cfg",
    "parse_config_json_safe",
    "parse_group_tool_policy",
]
