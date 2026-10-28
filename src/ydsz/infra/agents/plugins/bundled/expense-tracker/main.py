"""Expense tracker — analyze spending records with category breakdown."""

from __future__ import annotations

import json
from collections import defaultdict
from typing import Any

from ydsz_harness.plugins import PluginContext


def _payload(renderer: str, data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": renderer, "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


async def analyze_expenses(expenses_json: str) -> str:
    """分析消费记录并生成统计。expenses_json 为 JSON 字符串，格式：[{"date":"2024-01-15","category":"餐饮","amount":45.5,"note":"午餐"}...]。"""
    try:
        expenses = json.loads(expenses_json)
    except (json.JSONDecodeError, TypeError):
        return _payload(
            "expense_analysis",
            {"error": "invalid json"},
            "expenses_json 不是有效的 JSON 字符串。",
        )

    if not isinstance(expenses, list) or not expenses:
        return _payload(
            "expense_analysis",
            {"error": "empty"},
            "消费记录为空，请提供至少一条记录。",
        )

    total = 0.0
    categories: dict[str, float] = defaultdict(float)
    date_set: set[str] = set()

    for item in expenses:
        amount = float(item.get("amount", 0))
        total += amount
        categories[str(item.get("category", "其他"))] += amount
        date_set.add(str(item.get("date", "")))

    num_days = max(len(date_set), 1)
    daily_avg = round(total / num_days, 2)

    sorted_cats = sorted(categories.items(), key=lambda x: x[1], reverse=True)
    categories_summary = [
        {"category": cat, "amount": round(amt, 2), "percent": round(amt / total * 100, 1)}
        for cat, amt in sorted_cats
    ]

    highlights: list[str] = []
    top_cat, top_amt = sorted_cats[0]
    highlights.append(f"最大支出分类为「{top_cat}」，共消费 {top_amt:.2f} 元，占总支出 {top_amt / total * 100:.1f}%。")

    high_value = sorted(
        [e for e in expenses if isinstance(e, dict)],
        key=lambda x: float(x.get("amount", 0)),
        reverse=True,
    )[:1]
    if high_value:
        hv = high_value[0]
        highlights.append(
            f"单笔最高消费为 {float(hv.get('amount', 0)):.2f} 元（{hv.get('category', '')} — {hv.get('note', '')}）。"
        )

    if daily_avg > 0:
        highlights.append(f"日均消费 {daily_avg:.2f} 元（基于 {num_days} 天数据）。")

    data = {
        "total": round(total, 2),
        "categories": categories_summary,
        "daily_avg": daily_avg,
        "highlights": highlights,
    }

    text = (
        f"💰 支出统计：总消费 {total:.2f} 元，日均 {daily_avg:.2f} 元。"
        f"分类 TOP1：{top_cat}（{top_amt:.2f} 元）。"
    )

    return _payload("expense_analysis", data, text)


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "analyze_expenses",
        analyze_expenses,
        description="分析消费记录并生成统计摘要。参数 expenses_json 为 JSON 字符串格式的消费记录列表。",
    )
