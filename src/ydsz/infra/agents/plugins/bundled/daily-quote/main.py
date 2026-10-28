"""Daily quote — inspirational and philosophical quotes by theme."""

from __future__ import annotations

import hashlib
import json
from datetime import date
from typing import Any

from ydsz_harness.plugins import PluginContext

_THEMES = ("motivation", "wisdom", "humor", "love", "life")

_QUOTES: dict[str, list[tuple[str, str]]] = {
    "motivation": [
        ("千里之行，始于足下。", "老子"),
        ("不经一番寒彻骨，怎得梅花扑鼻香。", "黄檗禅师"),
        ("天行健，君子以自强不息。", "《周易》"),
        ("路漫漫其修远兮，吾将上下而求索。", "屈原"),
        ("宝剑锋从磨砺出，梅花香自苦寒来。", "古训"),
        ("Where there is a will, there is a way.", "Thomas Fuller"),
        (
            "Success is not final, failure is not fatal: it is the courage to continue that counts.",
            "Winston Churchill",
        ),
    ],
    "wisdom": [
        ("知者不惑，仁者不忧，勇者不惧。", "孔子"),
        ("吾生也有涯，而知也无涯。", "庄子"),
        ("纸上得来终觉浅，绝知此事要躬行。", "陆游"),
        ("博学之，审问之，慎思之，明辨之，笃行之。", "《中庸》"),
        ("The only true wisdom is in knowing you know nothing.", "Socrates"),
        ("In the middle of difficulty lies opportunity.", "Albert Einstein"),
        ("三人行，必有我师焉。", "孔子"),
    ],
    "humor": [
        ("我不是在喝咖啡，就是在去喝咖啡的路上。", "佚名"),
        ("代码能跑就别动，这不是偷懒，这是工程智慧。", "程序员谚语"),
        ("早起的鸟儿有虫吃，早起的虫儿被鸟吃。", "佚名"),
        ("我不是懒，我只是在节能模式。", "佚名"),
        (
            "Life is like a sewer — what you get out of it depends on what you put into it.",
            "Tom Lehrer",
        ),
        ("I'm not arguing, I'm just explaining why I'm right.", "佚名"),
        ("工作只是赚钱的方式，生活才是花钱的艺术。", "佚名"),
    ],
    "love": [
        ("山无陵，江水为竭，冬雷震震，夏雨雪，天地合，乃敢与君绝。", "汉乐府"),
        ("执子之手，与子偕老。", "《诗经》"),
        ("愿得一心人，白头不相离。", "卓文君"),
        ("世间万般皆可逝，唯有情深不可移。", "佚名"),
        ("Love all, trust a few, do wrong to none.", "William Shakespeare"),
        ("The best thing to hold onto in life is each other.", "Audrey Hepburn"),
        ("情人怨遥夜，竟夕起相思。", "张九龄"),
    ],
    "life": (
        ("人生如逆旅，我亦是行人。", "苏轼"),
        ("浮生若梦，为欢几何？", "李白"),
        ("采菊东篱下，悠然见南山。", "陶渊明"),
        ("人生得意须尽欢，莫使金樽空对月。", "李白"),
        ("We live in an age when unnecessary things are our only necessities.", "Oscar Wilde"),
        ("Happiness depends upon ourselves.", "Aristotle"),
        ("人生天地之间，若白驹之过隙，忽然而已。", "庄子"),
    ),
}


def _payload(data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": "daily_quote", "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


def _pick_index(theme: str, seed: str) -> int:
    quotes = _QUOTES.get(theme, [])
    if not quotes:
        return 0
    digest = hashlib.sha256(f"{theme}:{seed}".encode()).hexdigest()
    return int(digest[:8], 16) % len(quotes)


async def get_daily_quote(theme: str = "motivation") -> str:
    """获取每日一言。theme 可选 motivation/wisdom/humor/love/life。"""
    norm = (theme or "motivation").strip().lower()
    if norm not in _THEMES:
        return _payload(
            {"error": "unknown theme", "theme": theme},
            f"不支持的主题「{theme}」。可选：{', '.join(_THEMES)}。",
        )
    quotes = _QUOTES[norm]
    idx = _pick_index(norm, date.today().isoformat())
    quote, author = quotes[idx]
    data = {"theme": norm, "quote": quote, "author": author}
    return _payload(data, f"{quote}\n  —— {author}")


async def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "get_daily_quote",
        get_daily_quote,
        description="获取每日一言。theme 可选 motivation/wisdom/humor/love/life，每日按主题稳定选句。",
    )
