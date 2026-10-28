"""Color palette generator and conversion — local."""

from __future__ import annotations

import json
import re
from typing import Any

from ydsz_harness.plugins import PluginContext

_HEX = re.compile(r"^#?([0-9a-fA-F]{6})$")


def _payload(renderer: str, data: dict[str, Any], text: str) -> str:
    return json.dumps(
        {"ydsz_ui": {"renderer": renderer, "version": 1}, "data": data, "text": text},
        ensure_ascii=False,
    )


def _parse_hex(value: str) -> tuple[int, int, int]:
    raw = (value or "").strip()
    m = _HEX.match(raw)
    if not m:
        raise ValueError(f"无效的颜色格式：{raw}，请使用十六进制如 #3b82f6 或 3b82f6")
    h = m.group(1)
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _rgb_to_hex(r: int, g: int, b: int) -> str:
    return f"#{r:02x}{g:02x}{b:02x}"


def _rgb_to_hsl(r: int, g: int, b: int) -> tuple[float, float, float]:
    rf, gf, bf = r / 255.0, g / 255.0, b / 255.0
    mx, mn = max(rf, gf, bf), min(rf, gf, bf)
    lum = (mx + mn) / 2.0
    if mx == mn:
        return 0.0, 0.0, lum * 100.0
    d = mx - mn
    s = d / (2.0 - mx - mn) if lum > 0.5 else d / (mx + mn)
    if mx == rf:
        h = (gf - bf) / d + (6.0 if gf < bf else 0.0)
    elif mx == gf:
        h = (bf - rf) / d + 2.0
    else:
        h = (rf - gf) / d + 4.0
    return round(h * 60.0, 1), round(s * 100.0, 1), round(lum * 100.0, 1)


def _hue_shift(h: float, deg: float) -> float:
    return (h + deg) % 360.0


def _hsl_to_rgb(h: float, s: float, li: float) -> tuple[int, int, int]:
    s_n, l_n = s / 100.0, li / 100.0
    c = (1.0 - abs(2.0 * l_n - 1.0)) * s_n
    x = c * (1.0 - abs((h / 60.0) % 2 - 1.0))
    m = l_n - c / 2.0
    if h < 60:
        rf, gf, bf = c, x, 0
    elif h < 120:
        rf, gf, bf = x, c, 0
    elif h < 180:
        rf, gf, bf = 0, c, x
    elif h < 240:
        rf, gf, bf = 0, x, c
    elif h < 300:
        rf, gf, bf = x, 0, c
    else:
        rf, gf, bf = c, 0, x
    return (
        int(round((rf + m) * 255)),
        int(round((gf + m) * 255)),
        int(round((bf + m) * 255)),
    )


async def generate_palette(base_color: str, scheme: str = "analogous") -> str:
    """生成配色方案。base_color 为十六进制如 "#3b82f6"，scheme 可选 analogous/complementary/triadic/monochromatic。"""
    try:
        r, g, b = _parse_hex(base_color)
    except ValueError as exc:
        return _payload("color_palette", {"error": str(exc)}, str(exc))
    base_h, base_s, base_l = _rgb_to_hsl(r, g, b)
    scheme_name = (scheme or "analogous").strip().lower()
    schemes = {
        "analogous": [-30, 0, 30, 60, 90],
        "complementary": [0, 30, 150, 180, 210],
        "triadic": [0, 120, 240, 60, 180],
        "monochromatic": [0, 0, 0, 0, 0],
    }
    offsets = schemes.get(scheme_name, schemes["analogous"])
    colors: list[str] = []
    color_labels: list[str] = ["主色"]
    for i, offset in enumerate(offsets):
        if i >= 5:
            break
        if scheme_name == "monochromatic":
            adj_l = max(10.0, min(90.0, base_l + (i - 2) * 15))
            adj_s = max(10.0, min(100.0, base_s + (i % 2 - 0.5) * 10))
            nr, ng, nb = _hsl_to_rgb(base_h, adj_s, adj_l)
        else:
            new_h = _hue_shift(base_h, offset)
            nr, ng, nb = _hsl_to_rgb(new_h, base_s, base_l)
        colors.append(_rgb_to_hex(nr, ng, nb))
        if i > 0:
            color_labels.append(f"色{i + 1}")
    scheme_labels = {
        "analogous": "类似色",
        "complementary": "互补色",
        "triadic": "三角色",
        "monochromatic": "单色系",
    }
    return _payload(
        "color_palette",
        {
            "base": _rgb_to_hex(r, g, b),
            "colors": colors,
            "color_labels": color_labels,
            "scheme": scheme_name,
            "scheme_label": scheme_labels.get(scheme_name, scheme_name),
        },
        f"已生成 {scheme_labels.get(scheme_name, scheme_name)} 配色方案，主色 {colors[0]}，共 {len(colors)} 色。",
    )


async def hex_to_rgb(hex: str) -> str:
    """HEX 颜色转 RGB。hex 如 "#FF5733" 或 "FF5733"。"""
    try:
        r, g, b = _parse_hex(hex)
    except ValueError as exc:
        return _payload("color_convert", {"error": str(exc)}, str(exc))
    return _payload(
        "color_convert",
        {
            "hex": f"#{hex.lstrip('#')}" if hex.startswith("#") else f"#{hex}",
            "rgb": {"r": r, "g": g, "b": b},
        },
        f"rgb({r}, {g}, {b})",
    )


def setup(ctx: PluginContext) -> None:
    ctx.tool(
        "generate_palette",
        generate_palette,
        description='生成配色方案。base_color 为十六进制如 "#3b82f6"，scheme 可选 analogous/complementary/triadic/monochromatic。',
    )
    ctx.tool(
        "hex_to_rgb",
        hex_to_rgb,
        description='HEX 颜色转 RGB。hex 如 "#FF5733" 或 "FF5733"。',
    )
