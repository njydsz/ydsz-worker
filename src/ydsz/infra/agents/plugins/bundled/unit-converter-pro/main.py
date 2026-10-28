"""High-precision unit conversion — length, weight, temperature, area, volume, time, data."""

from __future__ import annotations

import json
from typing import Any

from ydsz_harness.plugins import PluginContext

_LENGTH_TO_M: dict[str, float] = {
    "m": 1.0,
    "km": 1000.0,
    "cm": 0.01,
    "mm": 0.001,
    "um": 1e-6,
    "nm": 1e-9,
    "mi": 1609.344,
    "yd": 0.9144,
    "ft": 0.3048,
    "in": 0.0254,
    "nmi": 1852.0,
}

_WEIGHT_TO_G: dict[str, float] = {
    "kg": 1000.0,
    "g": 1.0,
    "mg": 0.001,
    "ug": 1e-6,
    "t": 1e6,
    "lb": 453.59237,
    "oz": 28.349523125,
    "st": 6350.29318,
    "jin": 500.0,
    "liang": 50.0,
}

_AREA_TO_M2: dict[str, float] = {
    "m2": 1.0,
    "km2": 1e6,
    "cm2": 1e-4,
    "mm2": 1e-6,
    "ha": 1e4,
    "acre": 4046.8564224,
    "ft2": 0.09290304,
    "in2": 6.4516e-4,
    "mu": 666.6666667,
}

_VOLUME_TO_L: dict[str, float] = {
    "l": 1.0,
    "ml": 0.001,
    "m3": 1000.0,
    "cm3": 0.001,
    "mm3": 1e-6,
    "us_gal": 3.785411784,
    "uk_gal": 4.54609,
    "us_qt": 0.946352946,
    "us_pt": 0.473176473,
    "us_cup": 0.2365882365,
    "us_oz": 0.0295735295625,
    "tbsp": 0.01478676478125,
    "tsp": 0.00492892159375,
}

_TIME_TO_S: dict[str, float] = {
    "s": 1.0,
    "ms": 0.001,
    "us": 1e-6,
    "ns": 1e-9,
    "min": 60.0,
    "h": 3600.0,
    "d": 86400.0,
    "wk": 604800.0,
    "mo": 2592000.0,
    "yr": 31536000.0,
}

_DATA_TO_B: dict[str, float] = {
    "b": 1.0,
    "kb": 1024.0,
    "mb": 1048576.0,
    "gb": 1073741824.0,
    "tb": 1099511627776.0,
    "pb": 1125899906842624.0,
    "kib": 1024.0,
    "mib": 1048576.0,
    "gib": 1073741824.0,
    "tib": 1099511627776.0,
    "pib": 1125899906842624.0,
    "bit": 0.125,
    "kbit": 128.0,
    "mbit": 131072.0,
    "gbit": 134217728.0,
    "byte": 1.0,
}

_CATEGORY_MAP: dict[str, dict[str, float]] = {
    "length": _LENGTH_TO_M,
    "weight": _WEIGHT_TO_G,
    "area": _AREA_TO_M2,
    "volume": _VOLUME_TO_L,
    "time": _TIME_TO_S,
    "data": _DATA_TO_B,
    "digital_storage": _DATA_TO_B,
}

_TEMP = frozenset({"c", "f", "k"})


def _payload(data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": "unit_converter", "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


def _norm(unit: str) -> str:
    return (unit or "").strip().lower()


def _convert_temp(value: float, src: str, dst: str) -> float:
    if src == dst:
        return value
    if src == "c":
        k = value + 273.15
    elif src == "f":
        k = (value - 32.0) * 5.0 / 9.0 + 273.15
    else:
        k = value
    if dst == "c":
        return k - 273.15
    if dst == "f":
        return (k - 273.15) * 9.0 / 5.0 + 32.0
    return k


def _fmt(value: float) -> float | int:
    if value == 0:
        return 0
    if abs(value) >= 1e6 or abs(value) < 1e-4:
        return round(value, 10)
    return round(value, 10)


async def convert_units(
    value: float,
    from_unit: str,
    to_unit: str,
    category: str = "length",
) -> str:
    """高精度单位转换。支持 length/weight/temperature/area/volume/time/data/digital_storage。"""
    src = _norm(from_unit)
    dst = _norm(to_unit)
    try:
        v = float(value)
    except (TypeError, ValueError):
        return _payload({"error": "invalid value"}, "value 必须是数字。")

    if src in _TEMP or dst in _TEMP:
        if src not in _TEMP or dst not in _TEMP:
            return _payload(
                {"error": "category mismatch"},
                "温度单位 C/F/K 不能与其他类别互转。",
            )
        result = _convert_temp(v, src, dst)
        category = "temperature"
    else:
        norm_cat = _norm(category).replace(" ", "_")
        unit_map = _CATEGORY_MAP.get(norm_cat)
        if unit_map is None:
            return _payload(
                {"error": "unknown category", "category": category},
                f"不支持的单位类别「{category}。可选：length/weight/temperature/area/volume/time/data。",
            )
        if src not in unit_map:
            return _payload(
                {"error": "unknown source unit", "from_unit": from_unit},
                f"类别「{norm_cat}」不支持源单位「{from_unit}」。",
            )
        if dst not in unit_map:
            return _payload(
                {"error": "unknown target unit", "to_unit": to_unit},
                f"类别「{norm_cat}」不支持目标单位「{to_unit}」。",
            )
        base = v * unit_map[src]
        result = base / unit_map[dst]
        category = norm_cat

    result_fmt = _fmt(result)
    formula = f"{v} {src} → {result_fmt} {dst}"
    data = {
        "value": v,
        "from_unit": src,
        "to_unit": dst,
        "result": result_fmt,
        "formula": formula,
        "category": category,
    }
    text = f"转换结果：{v} {src} = {result_fmt} {dst}  \n公式/量级：{formula}"
    return _payload(data, text)


async def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "convert_units",
        convert_units,
        description="高精度单位转换。长度/重量/温度/面积/体积/时间/数据单位互转，共七大类别。",
    )
