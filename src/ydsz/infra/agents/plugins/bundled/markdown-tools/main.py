"""Markdown tools — table generation and title extraction."""

from __future__ import annotations

import json
import re
from typing import Any

from ydsz_harness.plugins import PluginContext


def _payload(renderer: str, data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": renderer, "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


async def md_generate_table(headers: str, rows: str) -> str:
    """生成 Markdown 表格。headers 为"列1,列2,列3"格式，rows 为"行1值1,行1值2;行2值1,行2值2"格式（分号分隔行）。"""
    header_list = [h.strip() for h in headers.split(",") if h.strip()] if headers.strip() else []
    if not header_list:
        return _payload("md_table", {"error": "no headers"}, "请提供至少一个表头，以逗号分隔。")

    cols = len(header_list)
    row_list: list[list[str]] = []
    if rows.strip():
        for row_str in rows.split(";"):
            if not row_str.strip():
                continue
            cells = row_str.split(",")
            # Pad or trim to match header count
            padded = (cells + [""] * cols)[:cols]
            row_list.append([c.strip() for c in padded])

    lines: list[str] = []
    lines.append("| " + " | ".join(header_list) + " |")
    lines.append("| " + " | ".join(["---"] * cols) + " |")
    for row in row_list:
        lines.append("| " + " | ".join(row) + " |")

    markdown = "\n".join(lines)
    data = {
        "markdown": markdown,
        "headers": header_list,
        "row_count": len(row_list),
        "col_count": cols,
    }
    text = f"已生成 {cols} 列 × {len(row_list)} 行 的 Markdown 表格。"
    return _payload("md_table", data, text)


async def md_extract_titles(md: str) -> str:
    """从 Markdown 文档中提取所有标题（# ~ ######），返回带层级列表。"""
    if not md.strip():
        return _payload("md_titles", {"error": "empty"}, "输入的 Markdown 文档为空。")

    titles: list[dict[str, Any]] = []
    for line in md.splitlines():
        match = re.match(r"^(#{1,6})\s+(.+)$", line.strip())
        if match:
            level = len(match.group(1))
            text = match.group(2).strip()
            titles.append({"level": level, "text": text})

    if not titles:
        return _payload("md_titles", {"titles": [], "count": 0}, "文档中未找到任何 Markdown 标题。")

    data = {"titles": titles, "count": len(titles)}
    summary_lines = [f"{'  ' * (t['level'] - 1)}{'#' * t['level']} {t['text']}" for t in titles]
    text = f"共提取 {len(titles)} 个标题：\n" + "\n".join(summary_lines)
    return _payload("md_titles", data, text)


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "md_generate_table",
        md_generate_table,
        description="根据表头和数据行生成 Markdown 表格。headers 为逗号分隔的列名，rows 为分号分隔的每行数据（行内逗号分隔单元格）。",
    )
    ctx.tool(
        "md_extract_titles",
        md_extract_titles,
        description="从 Markdown 文档中提取所有标题，返回包含层级的标题列表。参数 md 为 Markdown 文档字符串。",
    )
