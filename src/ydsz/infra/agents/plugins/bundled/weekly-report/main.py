"""Generate structured weekly report markdown templates."""

from __future__ import annotations

import json
import re
from datetime import datetime, timedelta
from typing import Any

from ydsz_harness.plugins import PluginContext


def _payload(data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": "weekly_report", "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


def _week_number(dt: datetime) -> int:
    return dt.isocalendar()[1]


def _split_items(raw: str) -> list[str]:
    return [line.strip() for line in re.split(r"[;\n，,]", raw or "") if line.strip()]


async def generate_weekly_report(
    title: str = "",
    highlights: str = "",
    challenges: str = "",
) -> str:
    """生成 W{n} 周报 Markdown 模板。

    title 为项目名称，highlights 为本周亮点（换行分隔），
    challenges 为风险/阻塞。返回结构化 Markdown 与覆盖章节列表。
    """
    now = datetime.now()
    week_no = _week_number(now)
    start = now - timedelta(days=now.weekday())
    end = start + timedelta(days=6)
    date_range = f"{start.strftime('%Y-%m-%d')} ~ {end.strftime('%Y-%m-%d')}"
    project = (title or "项目").strip()

    highlights_list = _split_items(highlights)
    challenges_list = _split_items(challenges)
    sections: list[str] = ["概览"]

    lines: list[str] = []
    lines.append(f"# {project} 周报 W{week_no}")
    lines.append("")
    lines.append(f"> 周期：{date_range}")
    lines.append("")

    # --- 本周完成 ---
    sections.append("本周完成")
    lines.append("## 一、本周完成")
    if highlights_list:
        for item in highlights_list:
            lines.append(f"- [x] {item}")
    lines.append("- [ ] （补充其他完成项）")
    lines.append("")

    # --- 本周进展 ---
    sections.append("本周进展")
    lines.append("## 二、本周进展")
    lines.append("| 事项 | 状态 | 说明 |")
    lines.append("| --- | --- | --- |")
    lines.append("| 事项一 | 进行中 | ... |")
    lines.append("")

    # --- 风险 / 阻塞 ---
    sections.append("风险与阻塞")
    lines.append("## 三、风险与阻塞")
    if challenges_list:
        lines.append("| # | 风险/阻塞 | 影响 | 应对措施 |")
        lines.append("| --- | --- | --- | --- |")
        for idx, item in enumerate(challenges_list, 1):
            lines.append(f"| {idx} | {item} | 待评估 | 待制定 |")
    else:
        lines.append("| # | 风险/阻塞 | 影响 | 应对措施 |")
        lines.append("| --- | --- | --- | --- |")
        lines.append("| — | 暂无 | — | — |")
    lines.append("")

    # --- 下周计划 ---
    sections.append("下周计划")
    lines.append("## 四、下周计划")
    lines.append("- [ ] 计划任务一")
    lines.append("- [ ] 计划任务二")
    lines.append("")

    # --- 需要协助 ---
    sections.append("需要协助")
    lines.append("## 五、需要协助 / 协同")
    lines.append("- 无")
    lines.append("")

    markdown = "\n".join(lines)
    section_text = "、".join(sections)
    return _payload(
        {
            "markdown": markdown,
            "sections": sections,
            "week_no": week_no,
            "date_range": date_range,
            "project": project,
        },
        f"已生成 {project} W{week_no} 周报模板（{date_range}），覆盖 {section_text} 共 {len(sections)} 个章节。",
    )


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "generate_weekly_report",
        generate_weekly_report,
        description="生成结构化周报 Markdown 模板。title 为项目名，highlights 为本周期亮点，challenges 为风险/阻塞。",
    )
