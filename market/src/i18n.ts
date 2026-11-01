/** Minimal i18n for the standalone Market app. */

export function detectLocale(): string {
  const stored = localStorage.getItem("ydsz_locale");
  if (stored) return stored;
  return navigator.language.startsWith("zh") ? "zh" : "en";
}

export function setLocale(locale: string) {
  localStorage.setItem("ydsz_locale", locale);
}

export const marketI18nResources = {
  en: {
    translation: {
      market: {
        title: "Marketplace",
        title_subtitle: "Discover & install Skills, Experts, Plugins, Connectors.",
        search: {
          placeholder: "Search the marketplace...",
          button: "Search",
        },
        tabs: {
          skills: "Skills",
          experts: "Experts",
          plugins: "Plugins",
          connectors: "Connectors",
          installed: "Installed",
        },
        card: {
          no_description: "No description",
          installed: "Installed",
          update_available: "Update available",
        },
        actions: {
          install: "Install",
          updating: "Updating...",
        },
        empty: {
          no_items: "No results found",
          no_results_hint: "Try different keywords",
          browse_hint: "Browse categories above or use search",
          installed_empty: "You haven't installed anything yet",
        },
        filters: {
          all_category: "All",
          count: "{{count}} items",
        },
      },
      auth: {
        login_required: "Sign in to install",
        go_to_dashboard: "Go to Dashboard",
      },
    },
  },
  zh: {
    translation: {
      market: {
        title: "市场",
        title_subtitle: "发现并安装技能、专家、插件、连接器。",
        search: {
          placeholder: "搜索市场...",
          button: "搜索",
        },
        tabs: {
          skills: "技能",
          experts: "专家",
          plugins: "插件",
          connectors: "连接器",
          installed: "已安装",
        },
        card: {
          no_description: "暂无描述",
          installed: "已安装",
          update_available: "有新版本",
        },
        actions: {
          install: "安装",
          updating: "安装中...",
        },
        empty: {
          no_items: "没有找到结果",
          no_results_hint: "试试其他关键词",
          browse_hint: "浏览上方分类或使用搜索",
          installed_empty: "暂未安装任何项目",
        },
        filters: {
          all_category: "全部",
          count: "共 {{count}} 项",
        },
      },
      auth: {
        login_required: "登录后才能安装",
        go_to_dashboard: "前往工作台",
      },
    },
  },
};
