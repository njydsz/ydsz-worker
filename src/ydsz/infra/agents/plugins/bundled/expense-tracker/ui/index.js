const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function ExpenseTracker(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) return null;

  const bg = dark
    ? "linear-gradient(135deg,#064e3b,#0f172a)"
    : "linear-gradient(135deg,#ecfdf5,#d1fae5)";
  const fg = dark ? "#d1fae5" : "#065f46";
  const accent = dark ? "#34d399" : "#059669";
  const muted = dark ? "rgba(209,250,229,0.6)" : "rgba(6,95,70,0.6)";

  return _jsxs("div", {
    style: { margin: 0, maxWidth: 380, borderRadius: 16, padding: 16, background: bg, color: fg },
    "data-Ydsz-plugin-ui": "expense-tracker",
    children: [
      _jsx("div", {
        style: { fontSize: 18, fontWeight: 800, marginBottom: 12 },
        children: "💰 消费分析",
      }),
      _jsxs("div", {
        style: {
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          padding: "8px 12px",
          borderRadius: 10,
          background: dark ? "rgba(52,211,153,0.15)" : "rgba(5,150,105,0.1)",
        },
        children: [
          _jsxs("div", { children: [
            _jsx("div", { style: { fontSize: 11, color: muted }, children: "总支出" }),
            _jsxs("div", { style: { fontSize: 22, fontWeight: 800, color: accent }, children: [d.total, " 元"] }),
          ]}),
          _jsxs("div", { children: [
            _jsx("div", { style: { fontSize: 11, color: muted }, children: "日均" }),
            _jsxs("div", { style: { fontSize: 22, fontWeight: 800, color: accent }, children: [d.daily_avg, " 元"] }),
          ]}),
        ],
      }),
      d.categories && d.categories.length
        ? _jsxs("div", { children: [
            _jsx("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: muted }, children: "分类汇总" }),
            d.categories.map(function (c, i) {
              return _jsxs("div", {
                key: i,
                style: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 13 },
                children: [
                  _jsx("span", { children: c.category }),
                  _jsxs("span", { style: { fontWeight: 600 }, children: [c.amount, " 元 (", c.percent, "%)"] }),
                ],
              });
            }),
          ])
        : null,
      d.highlights && d.highlights.length
        ? _jsxs("div", { style: { marginTop: 12 }, children: [
            _jsx("div", { style: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: muted }, children: "消费洞察" }),
            d.highlights.map(function (h, i) {
              return _jsxs("div", {
                key: i,
                style: { fontSize: 12, lineHeight: 1.6, marginBottom: 4 },
                children: ["• ", h],
              });
            }),
          ])
        : null,
    ],
  });
}

export function setup(host) {
  host.registerRenderer({ id: "expense_analysis", tools: ["analyze_expenses"], component: ExpenseTracker });
}
