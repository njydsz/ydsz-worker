"""Habit tracker — science-backed habit suggestions with tracking template."""

from __future__ import annotations

import json
from typing import Any

from ydsz_harness.plugins import PluginContext

_HABIT_LIBRARY: dict[str, list[dict[str, str]]] = {
    "健康": [
        {
            "habit": "每天喝够 8 杯水",
            "why": "充足水分可提升代谢、改善皮肤状态、减少疲劳感",
            "freq": "每天",
            "time": "全天分散饮用，晨起先喝一杯",
        },
        {
            "habit": "每天 30 分钟有氧运动",
            "why": "有氧运动可增强心肺功能、改善情绪、降低慢性病风险",
            "freq": "每天",
            "time": "早晨或傍晚，选择快走、跑步或骑行",
        },
        {
            "habit": "睡前 1 小时不看屏幕",
            "why": "减少蓝光刺激有助于分泌褪黑素，改善睡眠质量",
            "freq": "每天",
            "time": "睡前 1 小时开始执行",
        },
        {
            "habit": "每天冥想 5 分钟",
            "why": "正念冥想可降低焦虑、提升专注力、改善情绪稳定性",
            "freq": "每天",
            "time": "晨起或午间固定时段",
        },
        {
            "habit": "规律三餐，细嚼慢咽",
            "why": "稳定血糖、促进消化、避免暴饮暴食",
            "freq": "每天",
            "time": "固定时间进餐，每餐 20 分钟以上",
        },
        {
            "habit": "每天步行 8000 步",
            "why": "低强度活动累积可显著降低心血管风险",
            "freq": "每天",
            "time": "分散在全天，设定每小时起身活动",
        },
        {
            "habit": "每晚 11 点前入睡",
            "why": "充足且规律的睡眠是免疫系统修复和大脑排毒的关键",
            "freq": "每天",
            "time": "设置就寝提醒，逐步前移入睡时间",
        },
        {
            "habit": "每周 2 次拉伸/瑜伽",
            "why": "提升柔韧性、减少肌肉酸痛、预防运动损伤",
            "freq": "每周",
            "time": "固定在两天，每次 20–30 分钟",
        },
    ],
    "效率": [
        {
            "habit": "每日三件事清单",
            "why": "聚焦最重要的三项任务，避免忙碌但低效",
            "freq": "每天",
            "time": "早晨开工前列出当日 Top 3",
        },
        {
            "habit": "番茄工作法 25+5",
            "why": "固定时间块可减少分心、提升深度工作能力",
            "freq": "每天",
            "time": "工作时段循环执行，每 4 轮长休 15 分钟",
        },
        {
            "habit": "睡前 10 分钟复盘",
            "why": "每日复盘可固化好经验、暴露拖延点",
            "freq": "每天",
            "time": "睡前固定时段记录",
        },
        {
            "habit": "早起先看日历再处理消息",
            "why": "先掌握当日安排，避免被动响应打乱节奏",
            "freq": "每天",
            "time": "起床后 30 分钟内完成",
        },
        {
            "habit": "每周回顾 OKR / 周目标",
            "why": "周期性对齐目标与执行，及时调整方向",
            "freq": "每周",
            "time": "周五下班前或周日上午",
        },
        {
            "habit": "批量处理消息（每日 2–3 次）",
            "why": "减少上下文切换损耗，保持深度工作时段",
            "freq": "每天",
            "time": "设定固定时段集中处理即时通讯",
        },
        {
            "habit": "重要任务安排在上午 9–11 点",
            "why": "多数人此时精力最充沛，适合高认知负荷任务",
            "freq": "每天",
            "time": "将最难任务排入该时段",
        },
        {
            "habit": "关闭非必要通知",
            "why": "减少打断次数，保护专注时段完整性",
            "freq": "长期",
            "time": "每日保持，仅保留关键通知",
        },
    ],
    "学习": [
        {
            "habit": "每天阅读 20 分钟",
            "why": "持续输入可积累知识复利，拓宽认知边界",
            "freq": "每天",
            "time": "固定时段，如晨起或午休后",
        },
        {
            "habit": "用费曼技巧回顾当日所学",
            "why": "用简单语言讲解一遍，暴露理解漏洞",
            "freq": "每天",
            "time": "睡前或学习结束后立即执行",
        },
        {
            "habit": "每周写一篇学习笔记",
            "why": "输出倒逼输入，文字化可加深记忆",
            "freq": "每周",
            "time": "周末固定时段整理",
        },
        {
            "habit": "间隔重复复习（Anki/闪卡）",
            "why": "科学安排复习时点可对抗遗忘曲线",
            "freq": "每天",
            "time": "固定打开闪卡应用 10 分钟",
        },
        {
            "habit": "每日学一个新概念并记录",
            "why": "微小积累一年可达 365 个知识点",
            "freq": "每天",
            "time": "利用碎片时间，如通勤时收听",
        },
        {
            "habit": "加入学习社群并定期分享",
            "why": "社交承诺和输出压力可提升坚持率",
            "freq": "每周",
            "time": "固定参与社群活动",
        },
        {
            "habit": "每周复盘学习方法有效性",
            "why": "定期优化学习策略，避免低效重复",
            "freq": "每周",
            "time": "周末花 15 分钟反思",
        },
        {
            "habit": "设定每月阅读目标（1–2 本）",
            "why": "拆解年度目标为月度可执行单元",
            "freq": "每月",
            "time": "月初定目标，月末回顾",
        },
    ],
    "财务": [
        {
            "habit": "每日记账（收入与支出）",
            "why": "可视化现金流是理财第一步，减少无意识消费",
            "freq": "每天",
            "time": "睡前花 5 分钟记录当日交易",
        },
        {
            "habit": "每周查看一次账户余额",
            "why": "定期核对可及时发现异常、掌控财务状况",
            "freq": "每周",
            "time": "固定时段快速浏览",
        },
        {
            "habit": "每月制定并回顾预算",
            "why": "预算提供消费框架，月末复盘可优化下月分配",
            "freq": "每月",
            "time": "月初制定，月末对照执行",
        },
        {
            "habit": "储蓄先于消费（工资到账先转 20%）",
            "why": "储蓄优先策略（先支付自己）可强制积累财富",
            "freq": "每月",
            "time": "发薪日自动转账至储蓄账户",
        },
        {
            "habit": "每季度学习一个理财知识点",
            "why": "系统化积累金融素养，避免盲目投资",
            "freq": "每季度",
            "time": "利用碎片时间阅读或课程",
        },
        {
            "habit": "设置自动还款避免逾期",
            "why": "信用记录影响贷款资格和利率",
            "freq": "每月",
            "time": "绑定自动扣款，定期检查",
        },
        {
            "habit": "每半年检查一次投资组合",
            "why": "定期再平衡确保风险敞口与目标一致",
            "freq": "每半年",
            "time": "固定时间执行组合回顾",
        },
        {
            "habit": "消费前 24 小时冷静期（大额）",
            "why": "延迟决策可减少冲动购物，仅保留真正需要的消费",
            "freq": "按需",
            "time": "遇到大额消费时加入购物车等待 24 小时",
        },
    ],
}


_CATEGORY_LABELS = {
    "健康": "健康",
    "health": "健康",
    "效率": "效率",
    "efficiency": "效率",
    "学习": "学习",
    "learning": "学习",
    "财务": "财务",
    "finance": "财务",
}


def _payload(renderer: str, data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": renderer, "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


async def get_habit_suggestions(category: str = "efficiency", count: int = 4) -> str:
    """按分类获取科学习惯建议。category 可选：健康/效率/学习/财务，count（1–8，默认 4）。"""
    cat_key = _CATEGORY_LABELS.get((category or "").strip(), "效率")
    items_all = _HABIT_LIBRARY.get(cat_key, [])
    num = max(1, min(int(count or 4), len(items_all)))
    items = items_all[:num]
    data = {"category": cat_key, "items": items}
    text = f"「{cat_key}」维度筛选出 {len(items)} 项科学习惯建议"
    return _payload("habit_suggestions", data, text)


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "get_habit_suggestions",
        get_habit_suggestions,
        description=(
            "按分类获取科学习惯建议。category 可选：健康/效率/学习/财务，"
            "count 为返回条数（1–8，默认 4）。每项含习惯名、科学依据、频率、建议时段。"
        ),
    )
