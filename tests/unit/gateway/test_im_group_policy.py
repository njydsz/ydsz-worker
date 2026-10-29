"""Unit tests for the IM group tool policy (issue #2396)."""

from __future__ import annotations

from ydsz.infra.gateway.process.im_group_policy import (
    enforced_group_conversation_mode,
    group_tool_policy_from_cfg,
    owner_sender_ids_from_cfg,
    parse_config_json_safe,
)


def test_default_policy_is_inherit() -> None:
    assert group_tool_policy_from_cfg({}) == "inherit"
    assert group_tool_policy_from_cfg(None) == "inherit"
    assert group_tool_policy_from_cfg({"im_group_tool_policy": "bogus"}) == "inherit"


def test_enforced_mode_mapping() -> None:
    from ydsz.infra.gateway.process.im_group_policy import enforced_mode_for_policy

    assert enforced_mode_for_policy("inherit") is None
    assert enforced_mode_for_policy("read_only") == "ask"
    assert enforced_mode_for_policy("none") == "chat"


def test_dm_turns_are_never_restricted() -> None:
    cfg = {"im_group_tool_policy": "none"}
    assert (
        enforced_group_conversation_mode(cfg, is_group_chat=False, sender_id="u1") is None
    )


def test_group_non_owner_gets_enforced_mode() -> None:
    cfg = {"im_group_tool_policy": "none"}
    assert (
        enforced_group_conversation_mode(cfg, is_group_chat=True, sender_id="stranger")
        == "chat"
    )
    cfg_ro = {"im_group_tool_policy": "read_only"}
    assert (
        enforced_group_conversation_mode(cfg_ro, is_group_chat=True, sender_id="stranger")
        == "ask"
    )


def test_configured_owner_sender_bypasses_policy() -> None:
    cfg = {
        "im_group_tool_policy": "none",
        "im_group_owner_sender_ids": ["owner-openid-1"],
    }
    assert (
        enforced_group_conversation_mode(cfg, is_group_chat=True, sender_id="owner-openid-1")
        is None
    )
    assert (
        enforced_group_conversation_mode(cfg, is_group_chat=True, sender_id="member-2")
        == "chat"
    )


def test_inherit_policy_never_enforces() -> None:
    assert (
        enforced_group_conversation_mode(
            {"im_group_tool_policy": "inherit"}, is_group_chat=True, sender_id="x"
        )
        is None
    )


def test_owner_ids_ignores_malformed_config() -> None:
    assert owner_sender_ids_from_cfg({"im_group_owner_sender_ids": "owner"}) == frozenset()
    assert owner_sender_ids_from_cfg(
        {"im_group_owner_sender_ids": ["a", " ", 42]}
    ) == frozenset({"a", "42"})


def test_parse_config_json_safe() -> None:
    assert parse_config_json_safe('{"a": 1}') == {"a": 1}
    assert parse_config_json_safe("not json") == {}
    assert parse_config_json_safe("[1,2]") == {}
    assert parse_config_json_safe(None) == {}
