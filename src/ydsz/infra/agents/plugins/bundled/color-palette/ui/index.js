const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function PaletteCard(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) {
    return _jsx("div", {
      style: {
        padding: 14,
        color: "#ef4444",
        background: dark ? "#1c1917" : "#fef2f2",
        borderRadius: 12,
        fontSize: 13,
      },
      "data-Ydsz-plugin-ui": "color-palette",
      children: String(d.error),
    });
  }
  const colors = Array.isArray(d.colors) ? d.colors : [];
  const labels = Array.isArray(d.color_labels) ? d.color_labels : [];
  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 360,
      borderRadius: 18,
      overflow: "hidden",
      background: dark ? "#18181b" : "#fff",
      border: dark ? "1px solid #27272a" : "1px solid #e2e8f0",
      boxShadow: "0 10px 24px rgba(15,23,42,.08)",
    },
    "data-Ydsz-plugin-ui": "color-palette",
    children: [
      _jsx("div", {
        style: {
          padding: "12px 14px",
          fontWeight: 800,
          background: dark ? "#27272a" : "linear-gradient(90deg,#ede9fe,#dbeafe)",
          color: dark ? "#e4e4e7" : "#1e293b",
        },
        children: d.scheme_label || "配色方案",
      }),
      _jsx("div", {
        style: { display: "flex", height: 80 },
        children: colors.map((c, i) =>
          _jsx(
            "div",
            { style: { flex: 1, background: c }, title: labels[i] ? labels[i] + " " + c : c },
            String(i),
          ),
        ),
      }),
      _jsxs("div", {
        style: {
          padding: "10px 14px",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          background: dark ? "#1c1c1f" : "#f8fafc",
        },
        children: [
          colors.map((c, i) =>
            _jsxs(
              "span",
              {
                style: {
                  fontSize: 12,
                  fontFamily: "monospace",
                  background: dark ? "#27272a" : "#fff",
                  border: dark ? "1px solid #3f3f46" : "1px solid #e2e8f0",
                  borderRadius: 6,
                  padding: "3px 8px",
                  color: dark ? "#e4e4e7" : "#334155",
                },
                children: [labels[i] || "", " ", c],
              },
              String(i),
            ),
          ),
          d.base
            ? _jsxs("span", {
                style: { fontSize: 12, marginLeft: "auto", color: dark ? "#a1a1aa" : "#64748b" },
                children: ["主色: ", d.base],
              })
            : null,
        ],
      }),
    ],
  });
}

function ColorConvertCard(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) return null;
  const rgb = d.rgb || {};
  const swatch = d.hex || "#888";
  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 280,
      borderRadius: 18,
      overflow: "hidden",
      background: dark ? "#18181b" : "#fff",
      border: dark ? "1px solid #27272a" : "1px solid #e2e8f0",
      boxShadow: "0 10px 24px rgba(15,23,42,.08)",
    },
    "data-Ydsz-plugin-ui": "color-palette",
    children: [
      _jsx("div", { style: { height: 48, background: swatch } }),
      _jsxs("div", {
        style: { padding: 14, background: dark ? "#1c1c1f" : "#fff" },
        children: [
          _jsxs("div", {
            style: { fontWeight: 800, color: dark ? "#e4e4e7" : "#1e293b" },
            children: [d.hex || ""],
          }),
          _jsxs("div", {
            style: { fontSize: 13, marginTop: 6, opacity: 0.8, color: dark ? "#a1a1aa" : "#64748b" },
            children: ["rgb(" + (rgb.r || 0) + ", " + (rgb.g || 0) + ", " + (rgb.b || 0) + ")"],
          }),
        ],
      }),
    ],
  });
}

export function setup(host) {
  host.registerRenderer({ id: "color_palette", tools: ["generate_palette"], component: PaletteCard });
  host.registerRenderer({ id: "color_convert", tools: ["hex_to_rgb"], component: ColorConvertCard });
}

window.__Ydsz_PLUGINS__ = window.__Ydsz_PLUGINS__ || {};
window.__Ydsz_PLUGINS__["color-palette"] = { setup };
