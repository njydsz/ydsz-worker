const React = window.__Ydsz_REACT__;
const { jsx: _jsx, jsxs: _jsxs } = window.__Ydsz_JSX__;

const _CATEGORY_COLORS = {
  "健康": { accent: "#10B981", bg: "#ECFDF5", darkBg: "#064E3B" },
  "效率": { accent: "#6366F1", bg: "#EEF2FF", darkBg: "#312E81" },
  "学习": { accent: "#F59E0B", bg: "#FFFBEB", darkBg: "#78350F" },
  "财务": { accent: "#EF4444", bg: "#FEF2F2", darkBg: "#7F1D1D" },
};

function getColors(category, dark) {
  const c = _CATEGORY_COLORS[category] || _CATEGORY_COLORS["效率"];
  return dark ? { accent: c.accent, bg: c.darkBg, card: "#27272a" } : { accent: c.accent, bg: c.bg, card: "#ffffff" };
}

function HabitSuggestions(props) {
  const theme = props.host.getToolContext().theme;
  const dark = theme === "dark";
  const d = props.data && typeof props.data === "object" ? props.data : {};
  const items = Array.isArray(d.items) ? d.items : [];
  const category = d.category || "效率";
  const colors = getColors(category, dark);

  return _jsxs("div", {
    style: {
      margin: 0,
      maxWidth: 460,
      borderRadius: 20,
      overflow: "hidden",
      background: dark ? "#18181b" : "#fff",
      boxShadow: dark ? "0 12px 32px rgba(0,0,0,.4)" : "0 12px 28px rgba(16,185,129,.10)",
    },
    "data-Ydsz-plugin-ui": "habit-tracker",
    children: [
      _jsx("div", {
        style: {
          padding: "16px 20px",
          background: colors.bg,
          color: colors.accent,
          fontSize: 15,
          fontWeight: 800,
          letterSpacing: 0.3,
        },
        children: `✅ 习惯建议 · ${category}`,
      }),
      _jsx("div", {
        style: { padding: "6px 0" },
        children: items.map((item, i) =>
          _jsxs(
            "div",
            {
              style: {
                padding: "14px 20px",
                borderTop: i > 0 ? `1px solid ${dark ? "#27272a" : "#f1f5f9"}` : "none",
              },
              children: [
                _jsxs("div", {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  },
                  children: [
                    _jsx("span", {
                      style: {
                        fontSize: 18,
                        width: 28,
                        height: 28,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        background: dark ? colors.darkBg || colors.bg : "rgba(16,185,129,.12)",
                        fontWeight: 700,
                        fontSize: 13,
                      },
                      children: i + 1,
                    }),
                    _jsx("span", {
                      style: {
                        fontSize: 15,
                        fontWeight: 700,
                        color: dark ? "#f9fafb" : "#111827",
                      },
                      children: item.habit || "",
                    }),
                  ],
                }),
                _jsx("div", {
                  style: {
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: dark ? "#a1a1aa" : "#6b7280",
                    marginLeft: 36,
                  },
                  children: item.why || "",
                }),
                _jsxs("div", {
                  style: {
                    display: "flex",
                    gap: 8,
                    marginTop: 8,
                    marginLeft: 36,
                    flexWrap: "wrap",
                  },
                  children: [
                    _jsx("span", {
                      style: {
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        color: colors.accent,
                        background: dark ? "rgba(255,255,255,.08)" : "rgba(16,185,129,.10)",
                      },
                      children: item.freq || "",
                    }),
                    _jsx("span", {
                      style: {
                        padding: "3px 10px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 600,
                        color: dark ? "#fde68a" : "#b45309",
                        background: dark ? "rgba(253,230,138,.10)" : "rgba(251,191,36,.12)",
                      },
                      children: item.time || "",
                    }),
                  ],
                }),
              ],
            },
            i,
          ),
        ),
      }),
      _jsx("div", {
        style: {
          padding: "10px 20px 14px",
          fontSize: 11,
          color: dark ? "#52525b" : "#9ca3af",
          textAlign: "center",
          borderTop: `1px solid ${dark ? "#27272a" : "#f9fafb"}`,
        },
        children: "💡 选择 1–3 个习惯开始，坚持 21 天形成自动化",
      }),
    ],
  });
}

window.__Ydsz_PLUGINS__["habit-tracker"] = { default: HabitSuggestions };

export function setup(host) {
  host.registerRenderer({
    id: "habit_suggestions",
    tools: ["get_habit_suggestions"],
    component: HabitSuggestions,
  });
}
