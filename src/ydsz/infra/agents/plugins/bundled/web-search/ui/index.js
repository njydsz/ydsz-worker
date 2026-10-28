const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

function ExternalLink({ href, children, dark }) {
  return _jsx("a", {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
    style: {
      color: dark ? "#818CF8" : "#4F46E5",
      textDecoration: "none",
      fontWeight: 600,
    },
    children,
  });
}

function WebSearchResults(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  const results = Array.isArray(d.results) ? d.results : [];
  const query = d.query || "";

  if (d.error && results.length === 0) {
    return _jsx("div", {
      style: {
        margin: 0,
        maxWidth: 480,
        borderRadius: 16,
        padding: 18,
        background: dark ? "#1e293b" : "#fef2f2",
        color: dark ? "#fca5a5" : "#991b1b",
        boxShadow: dark ? "0 8px 24px rgba(0,0,0,.35)" : "0 8px 24px rgba(239,68,68,.12)",
      },
      "data-Ydsz-plugin-ui": "web-search",
      children: _jsx("div", { style: { fontSize: 13 }, children: d.error }),
    });
  }

  if (results.length === 0) {
    return _jsx("div", {
      style: {
        margin: 0,
        maxWidth: 480,
        borderRadius: 16,
        padding: 18,
        background: dark ? "#18181b" : "#f8fafc",
        color: dark ? "#a1a1aa" : "#64748b",
      },
      "data-Ydsz-plugin-ui": "web-search",
      children: `未找到「${query}」的相关结果，请尝试更换关键词。`,
    });
  }

  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 520,
      borderRadius: 20,
      overflow: "hidden",
      background: dark ? "#18181b" : "#fff",
      boxShadow: dark ? "0 12px 32px rgba(0,0,0,.4)" : "0 12px 28px rgba(79,70,229,.10)",
    },
    "data-Ydsz-plugin-ui": "web-search",
    children: [
      _jsx("div", {
        style: {
          padding: "14px 18px 10px",
          fontSize: 13,
          fontWeight: 700,
          color: dark ? "#818CF8" : "#4F46E5",
          letterSpacing: 0.3,
          background: dark ? "#1e1b4b" : "#f5f3ff",
        },
        children: `🔍 搜索「${query}」· ${results.length} 条结果`,
      }),
      _jsx("div", {
        style: { padding: "4px 0" },
        children: results.map((r, i) =>
          _jsxs(
            "div",
            {
              style: {
                padding: "12px 18px",
                borderTop: i > 0 ? `1px solid ${dark ? "#27272a" : "#f1f5f9"}` : "none",
              },
              children: [
                _jsx("div", {
                  children: _jsx(ExternalLink, {
                    href: r.url,
                    dark,
                    children: r.title || r.snippet || r.url,
                  }),
                }),
                _jsx("div", {
                  style: {
                    fontSize: 11,
                    color: dark ? "#34d399" : "#059669",
                    marginTop: 2,
                  },
                  children: r.url,
                }),
                _jsx("div", {
                  style: {
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: dark ? "#a1a1aa" : "#64748b",
                    marginTop: 6,
                  },
                  children: r.snippet || "",
                }),
              ],
            },
            i,
          ),
        ),
      }),
    ],
  });
}

window.__Ydsz_PLUGINS__["web-search"] = { default: WebSearchResults };

export function setup(host) {
  host.registerRenderer({
    id: "web_search",
    tools: ["web_search"],
    component: WebSearchResults,
  });
}
