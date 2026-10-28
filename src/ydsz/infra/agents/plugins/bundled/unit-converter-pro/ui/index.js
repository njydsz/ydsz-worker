const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function UnitConverterPro(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) return null;
  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 340,
      borderRadius: 16,
      padding: 18,
      background: dark ? "linear-gradient(135deg,#312e81,#1e1b4b)" : "linear-gradient(135deg,#eef2ff,#e0e7ff)",
      color: dark ? "#e0e7ff" : "#312e81",
      boxShadow: "0 12px 28px rgba(99,102,241,.18)",
      border: dark ? "1px solid rgba(129,140,248,.25)" : "1px solid rgba(99,102,241,.2)",
      fontWeight: 600,
    },
    "data-Ydsz-plugin-ui": "unit-converter-pro",
    children: [
      d.category ? _jsx("div", { style: { fontSize: 11, opacity: 0.7, letterSpacing: 1, fontWeight: 700 }, children: String(d.category).toUpperCase() }) : null,
      _jsxs("div", { style: { fontSize: 22, fontWeight: 800, marginTop: 6 }, children: [d.value, " ", _jsx("span", { style: { opacity: 0.7, fontSize: 16 }, children: d.from_unit })] }),
      _jsx("div", { style: { margin: "6px 0", opacity: 0.4, fontSize: 14 }, children: "↓" }),
      _jsxs("div", { style: { fontSize: 22, fontWeight: 800, color: dark ? "#a5b4fc" : "#4338ca" }, children: [d.result, " ", _jsx("span", { style: { opacity: 0.7, fontSize: 16 }, children: d.to_unit })] }),
      d.formula ? _jsx("div", { style: { fontSize: 11, marginTop: 10, opacity: 0.6 }, children: d.formula }) : null,
    ],
  });
}

export function setup(host) {
  host.registerRenderer({ id: "unit_converter", tools: ["convert_units"], component: UnitConverterPro });
}

window.__Ydsz_PLUGINS__["unit-converter-pro"] = { setup };
