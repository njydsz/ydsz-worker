"""Unit tests for cron PreToolTextFilter (issue #2384).

The filter once dropped narration emitted before ordinary tool calls. The
delivery contract changed to keep every streamed token (the model's planning
is part of the turn and removing it made summaries incoherent), so these
tests pin the current behaviour: text is accumulated verbatim regardless of
tool boundaries, and tool chunks contribute nothing of their own.
"""

from __future__ import annotations

from types import SimpleNamespace

from ydsz.infra.cron.delivery import PreToolTextFilter


def _tok(text: str) -> dict:
    return {"type": "token", "content": text}


def _call(name: str) -> dict:
    return {"type": "tool_call_chunk", "name": name, "index": 0, "id": "c1", "args": ""}


def _result(name: str) -> dict:
    return {"type": "tool_result", "messages": [SimpleNamespace(name=name)]}


def test_no_tools_delivers_full_text() -> None:
    f = PreToolTextFilter()
    for t in ("你好", "，", "最终答案"):
        f.observe(_tok(t))
    assert f.result() == "你好，最终答案"


def test_text_before_ordinary_tool_is_kept() -> None:
    """Planning text stays — dropping it would orphan the final answer."""
    f = PreToolTextFilter()
    f.observe(_tok("I'll start by gathering the current time..."))
    f.observe(_call("current_time"))
    f.observe(_result("current_time"))
    f.observe(_tok("今天周三，天气晴。"))
    assert f.result() == "I'll start by gathering the current time...今天周三，天气晴。"


def test_text_between_tool_results_is_kept() -> None:
    f = PreToolTextFilter()
    f.observe(_tok("计划一下……"))
    f.observe(_call("ls"))
    f.observe(_result("ls"))
    f.observe(_tok("中间说明"))
    f.observe(_call("ls"))
    f.observe(_result("ls"))
    f.observe(_tok("最终摘要"))
    assert f.result() == "计划一下……中间说明最终摘要"


def test_ask_agent_dispatch_wording_is_kept() -> None:
    f = PreToolTextFilter()
    f.observe(_tok("我来把任务分派给成员A……"))
    f.observe(_call("ask_agent"))
    f.observe(_result("ask_agent"))
    f.observe(_tok("分派完成，结果如下。"))
    out = f.result()
    assert "分派给成员A" in out
    assert "结果如下" in out


def test_sharded_tool_name_still_keeps_text() -> None:
    """Name arrives sharded on the call chunk; text is unaffected either way."""
    f = PreToolTextFilter()
    f.observe(_tok("thinking out loud ..."))
    f.observe({"type": "tool_call_chunk", "name": "", "index": 0, "id": "c1", "args": ""})
    f.observe(_result("read_file"))
    assert f.result() == "thinking out loud ..."


def test_result_without_named_messages_keeps_text() -> None:
    f = PreToolTextFilter()
    f.observe(_tok("internal plan"))
    f.observe({"type": "tool_result", "messages": []})
    assert f.result() == "internal plan"


def test_delta_chunks_and_tool_chunks_are_handled() -> None:
    """``delta`` is an accepted alias and tool chunks add no text."""
    f = PreToolTextFilter()
    f.observe({"type": "delta", "text": "hello"})
    f.observe(_call("read_file"))
    f.observe(_result("read_file"))
    f.observe({"type": "token", "content": " world"})
    assert f.result() == "hello world"


def test_empty_turn_yields_empty_string() -> None:
    f = PreToolTextFilter()
    assert f.result() == ""
