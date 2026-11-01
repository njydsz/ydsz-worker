import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Tabs, Typography, Space, Input, Radio, Pagination, Empty, Spin, Grid } from "antd";
import { ShoppingBag, Bot, Puzzle, Plug, Download, Sparkles, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MarketCard } from "../components/MarketCard";
import { useMarketList } from "../hooks/useMarketList";
import { useMarketCategories } from "../hooks/useMarketCategories";
import { useInstalledTab } from "../hooks/useInstalledTab";
import type { MarketItem } from "../api/market";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const TABS: { key: string; labelKey: string; icon: React.ReactNode; color: string }[] = [
  { key: "skills", labelKey: "skills", icon: <ShoppingBag size={16} />, color: "#1677ff" },
  { key: "experts", labelKey: "experts", icon: <Bot size={16} />, color: "#722ed1" },
  { key: "plugins", labelKey: "plugins", icon: <Puzzle size={16} />, color: "#13c2c2" },
  { key: "connectors", labelKey: "connectors", icon: <Plug size={16} />, color: "#fa8c16" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "downloads", label: "Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

/** Public dashboard URL — install actions redirect here. */
const DASHBOARD_URL = (import.meta as any).env?.VITE_DASHBOARD_URL ?? "/";

/** Inner content of one type tab (list + pagination). */
function MarketTypeTab({ type, query, onDetail }: { type: string; query: string; onDetail: (item: MarketItem) => void }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("relevance");
  const [selectedCategory, setSelectedCategory] = useState("");
  const pageSize = 12;

  const { categories } = useMarketCategories(type);
  const { items, total, loading } = useMarketList(type, {
    q: query || undefined,
    category: selectedCategory || undefined,
    sort,
    pageSize,
  });

  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const handleCategoryChange = useCallback((val: string) => {
    setSelectedCategory(val);
    setPage(1);
  }, []);

  const handleSortChange = useCallback((val: string) => {
    setSort(val);
    setPage(1);
  }, []);

  useEffect(() => { setPage(1); }, [query, sort, selectedCategory]);

  const mapped = useMemo(() => {
    return (categories || []).map((c) => ({ value: c.slug, label: c.label || c.slug }));
  }, [categories]);

  if (loading) {
    return <div style={{ padding: 80, textAlign: "center" }}><Spin size="large" /></div>;
  }

  if (!items.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size={4}>
            <Text type="secondary">{t("market.empty.no_items")}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {query ? t("market.empty.no_results_hint") : t("market.empty.browse_hint")}
            </Text>
          </Space>
        }
      />
    );
  }

  const cols = isMobile ? 1 : screens.md ? 2 : screens.lg ? 3 : 4;
  const gridTemplate = `repeat(${cols}, 1fr)`;

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Space wrap size={8} style={{ marginBottom: 4 }}>
        <Radio.Group
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="">{t("market.filters.all_category")}</Radio.Button>
          {mapped.map((c) => (
            <Radio.Button key={c.value} value={c.value}>{c.label}</Radio.Button>
          ))}
        </Radio.Group>
        <Radio.Group
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          optionType="button"
          buttonStyle="solid"
          size="small"
          options={SORT_OPTIONS}
        />
      </Space>

      <Text type="secondary" style={{ fontSize: 12 }}>
        {t("market.filters.count", { count: total })}
      </Text>

      <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: 16 }}>
        {items.map((item) => <MarketCard key={item.market_id} item={item} onDetail={onDetail} />)}
      </div>

      {total > pageSize && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 16 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
            showTotal={(tt, range) => `${range[0]}-${range[1]} of ${tt}`}
          />
        </div>
      )}
    </Space>
  );
}

/** Installed tab. */
function InstalledTab(_props: { query: string }) {
  const { t } = useTranslation();
  const { items, loading } = useInstalledTab();

  if (loading) return <div style={{ padding: 80, textAlign: "center" }}><Spin size="large" /></div>;
  if (!items.length) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <Space direction="vertical" size={4}>
            <Text type="secondary">{t("market.empty.installed_empty")}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <a href={DASHBOARD_URL} target="_blank" rel="noopener">
                {t("auth.go_to_dashboard")} <ExternalLink size={12} />
              </a>
            </Text>
          </Space>
        }
      />
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
      <pre style={{ fontSize: 12 }}>{JSON.stringify(items.slice(0, 3), null, 2)}</pre>
    </div>
  );
}

/** Main Market SPA page. */
export const MarketApp: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("skills");
  const [search, setSearch] = useState("");
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
  }, []);

  return (
    <div
      style={{
        padding: isMobile ? 16 : 32,
        maxWidth: 1400,
        margin: "0 auto",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div style={{ marginBottom: 32 }}>
        <Space direction="vertical" size={4}>
          <Title level={2} style={{ margin: 0 }}>
            <Sparkles size={24} style={{ marginRight: 8, verticalAlign: "text-bottom" }} />
            {t("market.title")}
          </Title>
          <Text type="secondary">
            {t("market.title_subtitle")}
          </Text>
        </Space>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Input.Search
          placeholder={t("market.search.placeholder")}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          onSearch={handleSearch}
          enterButton
          size="large"
          style={{ maxWidth: 480 }}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(key) => { setActiveTab(key); setSearch(""); }}
        size="middle"
        tabBarGutter={isMobile ? 8 : 24}
        style={{ marginBottom: 16 }}
        items={TABS.map(({ key, labelKey, icon, color }) => ({
          key,
          label: (
            <Space size={isMobile ? 4 : 8}>
              <span style={{ color }}>{icon}</span>
              <span>{t(`market.tabs.${labelKey}`)}</span>
            </Space>
          ),
        }))}
      />

      <div style={{ marginTop: 16 }}>
        {activeTab === "installed" ? (
          <InstalledTab query={search} />
        ) : (
          <MarketTypeTab type={activeTab} query={search} onDetail={() => {}} />
        )}
      </div>
    </div>
  );
};
