const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function WeeklyReport(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};

  const [copied, setCopied] = React.useState(false);

  if (d.error) return null;

  const sections = Array.isArray(d.sections) ? d.sections : [];
  const markdown = d.markdown || "";
  const weekNo = d.week_no || "?";
  const dateRange = d.date_range || "";
  const project = d.project || "项目";

  const palette = dark
    ? { bg: "#18181b", border: "#27272a", card: "#0f172a", accent: "#3b82f6", text: "#e2e8f0", sub: "#94a3b8" }
    : { bg: "#ffffff", border: "#e2e8f0", card: "#eff6ff", accent: "#2563eb", text: "#0f172a", sub: "#64748b" };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(markdown).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    }
  };

  const sectionPills = sections.map((s) =>
    _jsx(
      "span",
      {
        style: {
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: 99,
          fontSize: 11,
          fontWeight: 600,
          background: dark ? "#1e293b" : "#dbeafe",
          color: palette.accent,
          border: `1px solid ${dark ? "#334155" : "#bfdbfe"}`,
        },
        children: s,
      },
      s,
    ),
  );

  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 560,
      borderRadius: 18,
      overflow: "hidden",
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      boxShadow: "0 10px 28px rgba(15,23,42,.12)",
      color: palette.text,
    },
    "data-Ydsz-plugin-ui": "weekly-report",
    children: [
      _jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: dark ? "linear-gradient(135deg,#0f172a,#1e3a8a)" : "linear-gradient(135deg,#2563eb,#7c3aed)",
          color: "#fff",
        },
        children: [
          _jsxs("div", { children: [
            _jsx("div", { style: { fontSize: 12, opacity: 0.85 }, children: `📋 周报助手 · W${weekNo}` }),
            _jsx("div", { style: { fontWeight: 800, fontSize: 16, marginTop: 2 }, children: project }),
          ] }),
          _jsx("div", {
            style: { fontSize: 11, opacity: 0.85, textAlign: "right" },
            children: dateRange,
          }),
        ],
      }),
      _jsxs("div", { style: { padding: "14px 16px 4px" }, children: [
        _jsx("div", {
          style: { fontSize: 12, fontWeight: 700, color: palette.sub, marginBottom: 6 },
          children: "覆盖章节",
        }),
        _jsx("div", { style: { display: "flex", gap: 6, flexWrap: "wrap" }, children: sectionPills }),
      ] }),
      _jsx("div", {
        style: {
          margin: "10px 16px",
          borderRadius: 10,
          padding: 12,
          background: palette.card,
          border: `1px solid ${palette.border}`,
          fontSize: 12,
          fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          lineHeight: 1.6,
          maxHeight: 260,
          overflowY: "auto",
          color: palette.text,
        },
        children: markdown,
      }),
      _jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 16px 14px",
        },
        children: [
          _jsx("button", {
            onClick: handleCopy,
            style: {
              padding: "6px 14px",
              borderRadius: 8,
              background: palette.accent,
              color: "#fff",
              border: "none",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            },
            children: copied ? "已复制" : "复制 Markdown",
          }),
          _jsx("span", {
            style: { fontSize: 11, color: palette.sub },
            children: `共 ${sections.length} 个章节 · ${markdown.length} 字符`,
          }),
        ],
      }),
    ],
  });
}

export function setup(host) {
  window.__Ydsz_PLUGINS__["weekly-report"] = { component: WeeklyReport };
  host.registerRenderer({
    id: "weekly_report",
    tools: ["generate_weekly_report"],
    component: WeeklyReport,
  });
}
