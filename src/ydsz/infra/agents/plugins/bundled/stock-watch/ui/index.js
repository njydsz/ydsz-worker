const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function changeColor(pct, dark) {
  if (pct == null || Number.isNaN(Number(pct))) return "inherit";
  const n = Number(pct);
  if (n === 0) return "inherit";
  if (dark) return n > 0 ? "#ef4444" : "#22c55e";
  return n > 0 ? "#ef4444" : "#16a34a";
}

function WatchListCard(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  const rows = Array.isArray(d.watch_list) ? d.watch_list : [];
  const actionMap = { show: "自选股列表", add: "添加自选股", remove: "移除自选股" };
  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 480,
      borderRadius: 18,
      overflow: "hidden",
      background: dark ? "#18181b" : "#fff",
      border: dark ? "1px solid #27272a" : "1px solid #e2e8f0",
      boxShadow: "0 10px 24px rgba(15,23,42,.08)",
    },
    "data-Ydsz-plugin-ui": "stock-watch",
    children: [
      _jsx("div", {
        style: {
          padding: "12px 14px",
          fontWeight: 800,
          background: dark ? "#27272a" : "linear-gradient(90deg,#ecfdf5,#eff6ff)",
          color: dark ? "#e4e4e7" : "#1e293b",
        },
        children: actionMap[d.action] || "自选股",
      }),
      _jsx("table", {
        style: { width: "100%", borderCollapse: "collapse" },
        children: _jsxs("tbody", {
          children: [
            rows.map((row, i) =>
              _jsxs(
                "tr",
                {
                  style: {
                    background: i % 2 ? (dark ? "#1c1c1f" : "#f8fafc") : "transparent",
                  },
                  children: [
                    _jsx("td", {
                      style: { padding: "10px 14px", fontWeight: 700, color: dark ? "#e4e4e7" : "#1e293b" },
                      children: row.name || row.symbol,
                    }),
                    _jsx("td", {
                      style: { padding: "10px 8px", fontSize: 13, color: dark ? "#a1a1aa" : "#64748b" },
                      children: row.symbol,
                    }),
                    _jsx("td", {
                      style: {
                        padding: "10px 8px",
                        textAlign: "right",
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 700,
                        color: dark ? "#e4e4e7" : "#1e293b",
                      },
                      children: row.price != null ? String(row.price) : "--",
                    }),
                    _jsx("td", {
                      style: {
                        padding: "10px 14px",
                        textAlign: "right",
                        color: changeColor(row.pct, dark),
                        fontVariantNumeric: "tabular-nums",
                        fontWeight: 800,
                        fontSize: 13,
                      },
                      children:
                        row.pct == null
                          ? ""
                          : (Number(row.pct) > 0 ? " " : Number(row.pct) < 0 ? " " : "") +
                            Number(row.pct).toFixed(2) + "%",
                    }),
                  ],
                },
                String(row.symbol),
              ),
            ),
            rows.length === 0
              ? _jsx("tr", {
                  children: _jsx("td", {
                    style: {
                      padding: "20px 14px",
                      textAlign: "center",
                      color: dark ? "#52525b" : "#94a3b8",
                      fontSize: 13,
                    },
                    colSpan: 4,
                    children: "暂无自选股，使用 watch_list 添加。",
                  }),
                })
              : null,
          ],
        }),
      }),
    ],
  });
}

export function setup(host) {
  host.registerRenderer({ id: "stock_watch", tools: ["watch_list"], component: WatchListCard });
}

window.__Ydsz_PLUGINS__ = window.__Ydsz_PLUGINS__ || {};
window.__Ydsz_PLUGINS__["stock-watch"] = { setup };
