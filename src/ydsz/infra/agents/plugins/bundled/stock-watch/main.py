"""Watchlist management with simulated quotes."""

from __future__ import annotations

import json
import random
from typing import Any

from ydsz_harness.plugins import PluginContext

_DEFAULT_LIST: dict[str, dict[str, Any]] = {
    "AAPL": {"name": "苹果公司", "price": 178.5, "prev": 177.2},
    "MSFT": {"name": "微软", "price": 338.1, "prev": 340.5},
    "GOOGL": {"name": "谷歌", "price": 135.7, "prev": 133.8},
    "TSLA": {"name": "特斯拉", "price": 248.3, "prev": 252.1},
    "00700": {"name": "腾讯控股", "price": 365.6, "prev": 368.2},
    "600519": {"name": "贵州茅台", "price": 1725.0, "prev": 1720.0},
}

_SIMULATED: dict[str, tuple[float, float]] = {
    "AAPL": (175.0, 182.0),
    "MSFT": (330.0, 345.0),
    "GOOGL": (130.0, 140.0),
    "TSLA": (235.0, 265.0),
    "00700": (355.0, 378.0),
    "600519": (1700.0, 1760.0),
}


def _payload(renderer: str, data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": renderer, "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


def _update_quote(sym: str) -> dict[str, Any]:
    base = dict(_DEFAULT_LIST.get(sym, {}))
    if base:
        if sym in _SIMULATED:
            lo, hi = _SIMULATED[sym]
            price = round(random.uniform(lo, hi), 2)
        else:
            price = base["price"]
        prev = base.get("prev", price)
        change = round(price - prev, 2)
        pct = round(change / prev * 100, 2) if prev else 0.0
        base["price"] = price
        base["prev"] = prev
        base["change"] = change
        base["pct"] = pct
    return base


async def watch_list(action: str = "show", symbols: str = "") -> str:
    """自选股列表管理。action 可选 show/add/remove，symbols 为逗号分隔代码如 "AAPL,MSFT,00700"。"""
    act = (action or "show").strip().lower()
    syms = [s.strip().upper() for s in (symbols or "").split(",")]
    if act == "add":
        added = [s for s in syms if s and s not in _DEFAULT_LIST]
        for s in added:
            if s not in _SIMULATED:
                _SIMULATED[s] = (10.0, 200.0)
            _DEFAULT_LIST[s] = {"name": s, "price": round(random.uniform(10, 200), 2), "prev": 0}
        watch_data = [_update_quote(s) for s in _DEFAULT_LIST]
        return _payload(
            "stock_watch",
            {"action": act, "symbols": syms, "watch_list": watch_data},
            f"已添加 {len(added)} 只股票，自选股共 {len(watch_data)} 只。",
        )
    elif act == "remove":
        removed = [s for s in syms if s in _DEFAULT_LIST]
        for s in removed:
            del _DEFAULT_LIST[s]
            _SIMULATED.pop(s, None)
        watch_data = [_update_quote(s) for s in _DEFAULT_LIST]
        return _payload(
            "stock_watch",
            {"action": act, "symbols": syms, "watch_list": watch_data},
            f"已移除 {len(removed)} 只股票，自选股共 {len(watch_data)} 只。",
        )
    else:
        watch_data = [_update_quote(s) for s in _DEFAULT_LIST]
        return _payload(
            "stock_watch",
            {"action": act, "watch_list": watch_data},
            f"当前自选股 {len(watch_data)} 只。",
        )


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "watch_list",
        watch_list,
        description='自选股列表管理。action 可选 show/add/remove，symbols 为逗号分隔代码如 "AAPL,MSFT,00700"。',
    )
