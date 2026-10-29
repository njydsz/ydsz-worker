"""Code Review Skill — sample ported skill plugin (kind=skill).

Pure-prompt skill: syncs the code-review skill into the agent workspace.
No callable tools are registered.
"""

from __future__ import annotations

from ydsz_harness.plugins import PluginContext


def setup(ctx: PluginContext) -> None:
    ctx.skills("skills")
