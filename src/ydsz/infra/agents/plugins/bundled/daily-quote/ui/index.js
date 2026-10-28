const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function DailyQuote(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) return null;
  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 420,
      borderRadius: 20,
      padding: 20,
      background: dark ? "linear-gradient(165deg,#78350f,#451a03)" : "linear-gradient(165deg,#fffbeb,#fef3c7)",
      color: dark ? "#fef3c7" : "#78350f",
      boxShadow: "0 12px 28px rgba(245,158,11,.18)",
      border: dark ? "1px solid rgba(251,191,36,.25)" : "1px solid rgba(245,158,11,.2)",
    },
    "data-Ydsz-plugin-ui": "daily-quote",
    children: [
      _jsx("div", { style: { fontSize: 12, fontWeight: 700, opacity: 0.75, letterSpacing: 1 }, children: d.theme ? `✨ ${String(d.theme).toUpperCase()}` : "✨ DAILY QUOTE" }),
      _jsx("div", { style: { fontSize: 17, fontWeight: 600, marginTop: 12, lineHeight: 1.7 }, children: d.quote || "" }),
      _jsxs("div", { style: { marginTop: 14, fontSize: 13, opacity: 0.75, textAlign: "right", fontStyle: "italic" }, children: ["—— ", d.author || "佚名"] }),
    ],
  });
}

export function setup(host) {
  host.registerRenderer({ id: "daily_quote", tools: ["get_daily_quote"], component: DailyQuote });
}

window.__Ydsz_PLUGINS__["daily-quote"] = { setup };
