const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function MdTable(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) return null;

  const bg = dark
    ? "linear-gradient(135deg,#1e1b4b,#0f172a)"
    : "linear-gradient(135deg,#f5f3ff,#ede9fe)";
  const fg = dark ? "#ede9fe" : "#4c1d95";
  const accent = dark ? "#a78bfa" : "#7C3AED";
  const muted = dark ? "rgba(237,233,254,0.6)" : "rgba(76,29,149,0.6)";
  const borderColor = dark ? "rgba(167,139,250,0.25)" : "rgba(124,58,237,0.2)";

  if (!d.headers || !d.headers.length) return null;

  return _jsxs("div", {
    style: { margin: 0, maxWidth: 480, borderRadius: 16, padding: 16, background: bg, color: fg },
    "data-Ydsz-plugin-ui": "markdown-tools",
    children: [
      _jsxs("div", { style: { fontSize: 14, fontWeight: 700, marginBottom: 10, color: accent }, children: [
        "📊 Markdown 表格 (", d.row_count, " 行 × ", d.col_count, " 列)"
      ]}),
      _jsx("div", {
        style: { borderRadius: 10, overflow: "hidden", border: "1px solid " + borderColor },
        children: _jsx("table", {
          style: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
          children: _jsxs("tbody", {
            children: [
              _jsx("thead", {
                children: _jsx("tr", {
                  children: d.headers.map(function (h, i) {
                    return _jsx("th", {
                      key: i,
                      style: {
                        padding: "8px 12px",
                        textAlign: "left",
                        background: dark ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.08)",
                        fontWeight: 700,
                        borderBottom: "1px solid " + borderColor,
                        color: accent,
                      },
                      children: h,
                    });
                  }),
                }),
              }),
              d.markdown && d.row_count > 0
                ? _jsx("tr", {
                    children: _jsx("td", {
                      colSpan: d.col_count,
                      style: { padding: "8px 12px", fontSize: 12, color: muted, fontFamily: "monospace", whiteSpace: "pre-wrap" },
                      children: d.markdown.split("\n").slice(2).join("\n"),
                    }),
                  })
                : null,
            ],
          }),
        }),
      }),
    ],
  });
}

function MdTitles(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  if (d.error) return null;

  const bg = dark
    ? "linear-gradient(135deg,#1e1b4b,#0f172a)"
    : "linear-gradient(135deg,#f5f3ff,#ede9fe)";
  const fg = dark ? "#ede9fe" : "#4c1d95";
  const accent = dark ? "#a78bfa" : "#7C3AED";
  const muted = dark ? "rgba(237,233,254,0.6)" : "rgba(76,29,149,0.6)";

  const titles = d.titles || [];

  return _jsxs("div", {
    style: { margin: 0, maxWidth: 420, borderRadius: 16, padding: 16, background: bg, color: fg },
    "data-Ydsz-plugin-ui": "markdown-tools",
    children: [
      _jsxs("div", { style: { fontSize: 14, fontWeight: 700, marginBottom: 10, color: accent }, children: [
        "📑 标题目录 (", d.count, " 个)"
      ]}),
      titles.length === 0
        ? _jsx("div", { style: { fontSize: 13, color: muted }, children: "文档中未找到任何标题。" })
        : titles.map(function (t, i) {
            return _jsxs("div", {
              key: i,
              style: { padding: "3px 0", paddingLeft: (t.level - 1) * 16, fontSize: 13, lineHeight: 1.6 },
              children: [
                _jsx("span", { style: { color: accent, marginRight: 6, fontWeight: 700 }, children: "#".repeat(t.level) }),
                _jsx("span", { children: t.text }),
              ],
            });
          }),
    ],
  });
}

export function setup(host) {
  host.registerRenderer({ id: "md_table", tools: ["md_generate_table"], component: MdTable });
  host.registerRenderer({ id: "md_titles", tools: ["md_extract_titles"], component: MdTitles });
}
