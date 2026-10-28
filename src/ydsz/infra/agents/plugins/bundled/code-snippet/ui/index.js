const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

const LANG_META = {
  python: { emoji: "🐍", label: "Python", accent: "#3b82f6" },
  javascript: { emoji: "⚡", label: "JavaScript", accent: "#f59e0b" },
  shell: { emoji: "🖥️", label: "Shell", accent: "#22c55e" },
  git: { emoji: "🔀", label: "Git", accent: "#ef4444" },
  sql: { emoji: "🗄️", label: "SQL", accent: "#8b5cf6" },
  docker: { emoji: "🐳", label: "Docker", accent: "#06b6d4" },
  react: { emoji: "⚛️", label: "React", accent: "#0ea5e9" },
};

function CodeSnippet(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};

  const [copiedIdx, setCopiedIdx] = React.useState(-1);

  if (d.error) {
    const supported = Array.isArray(d.supported) ? d.supported : [];
    return _jsxs("div", {
      style: {
        margin: 0,
        maxWidth: 480,
        borderRadius: 14,
        padding: 14,
        background: dark ? "#18181b" : "#fff",
        border: `1px solid ${dark ? "#27272a" : "#e2e8f0"}`,
        color: dark ? "#e2e8f0" : "#0f172a",
        fontSize: 13,
      },
      "data-Ydsz-plugin-ui": "code-snippet",
      children: [
        _jsx("div", { style: { fontWeight: 700, color: "#ef4444" }, children: "⚠️ 不支持的语言" }),
        _jsx("div", { style: { marginTop: 6, opacity: 0.75 }, children: `支持：${supported.join(" / ")}` }),
      ],
    });
  }

  const snippets = Array.isArray(d.snippets) ? d.snippets : [];
  const lang = d.language || "";
  const meta = LANG_META[lang] || { emoji: "📦", label: lang, accent: "#64748b" };
  const keyword = d.keyword || "";

  const palette = dark
    ? { bg: "#18181b", border: "#27272a", card: "#0f172a", text: "#e2e8f0", sub: "#94a3b8", code: "#e2e8f0" }
    : { bg: "#ffffff", border: "#e2e8f0", card: "#f8fafc", text: "#0f172a", sub: "#64748b", code: "#1e293b" };

  const handleCopy = (code, idx) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(-1), 1500);
      });
    }
  };

  const tagPills = (tags) =>
    (Array.isArray(tags) ? tags : []).map((t) =>
      _jsx(
        "span",
        {
          style: {
            fontSize: 10,
            padding: "1px 6px",
            borderRadius: 4,
            background: dark ? "#1e293b" : "#f1f5f9",
            color: dark ? "#94a3b8" : "#64748b",
            border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
          },
          children: t,
        },
        t,
      ),
    );

  const items = snippets.map((snip, idx) =>
    _jsxs(
      "div",
      {
        style: {
          borderRadius: 10,
          padding: "10px 12px",
          background: palette.card,
          border: `1px solid ${palette.border}`,
          marginBottom: 8,
        },
        children: [
          _jsxs("div", {
            style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
            children: [
              _jsx("span", { style: { fontWeight: 700, fontSize: 13 }, children: snip.title }),
              _jsx("button", {
                onClick: () => handleCopy(snip.code, idx),
                style: {
                  fontSize: 11,
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: `1px solid ${palette.border}`,
                  background: copiedIdx === idx ? "#22c55e" : "transparent",
                  color: copiedIdx === idx ? "#fff" : palette.sub,
                  cursor: "pointer",
                  fontWeight: 600,
                },
                children: copiedIdx === idx ? "已复制" : "复制",
              }),
            ],
          }),
          _jsx("pre", {
            style: {
              margin: "4px 0",
              padding: 8,
              borderRadius: 6,
              background: dark ? "#020617" : "#f1f5f9",
              fontSize: 11,
              fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              color: palette.code,
              border: `1px solid ${dark ? "#1e293b" : "#e2e8f0"}`,
              maxHeight: 160,
              overflowY: "auto",
            },
            children: snip.code,
          }),
          _jsx("div", { style: { display: "flex", gap: 4, flexWrap: "wrap" }, children: tagPills(snip.tags) }),
        ],
      },
      String(idx),
    ),
  );

  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 520,
      borderRadius: 16,
      overflow: "hidden",
      background: palette.bg,
      border: `1px solid ${palette.border}`,
      boxShadow: "0 10px 28px rgba(15,23,42,.12)",
      color: palette.text,
    },
    "data-Ydsz-plugin-ui": "code-snippet",
    children: [
      _jsxs("div", {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px",
          background: dark ? "#27272a" : `${meta.accent}15`,
          borderBottom: `1px solid ${palette.border}`,
        },
        children: [
          _jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
            _jsx("span", { style: { fontSize: 18 }, children: meta.emoji }),
            _jsx("span", { style: { fontWeight: 800, fontSize: 15 }, children: meta.label }),
          ] }),
          _jsxs("div", { style: { fontSize: 11, color: palette.sub }, children: [
            `${snippets.length} 条`,
            keyword ? ` · 关键词 "${keyword}"` : "",
          ] }),
        ],
      }),
      _jsx("div", {
        style: { padding: "10px 12px", maxHeight: 480, overflowY: "auto" },
        children: items.length > 0 ? items : _jsx("div", { style: { textAlign: "center", padding: 24, color: palette.sub, fontSize: 13 }, children: "未找到匹配的片段" }),
      }),
    ],
  });
}

export function setup(host) {
  window.__Ydsz_PLUGINS__["code-snippet"] = { component: CodeSnippet };
  host.registerRenderer({
    id: "code_snippet",
    tools: ["search_snippets"],
    component: CodeSnippet,
  });
}
