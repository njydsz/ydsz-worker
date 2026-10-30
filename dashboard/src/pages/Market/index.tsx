import React, { useState, useCallback } from "react";
import { Tabs, Typography, Space } from "antd";
import { ShoppingBag, Bot, Puzzle, Plug, Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MarketSearchBar } from "./components/MarketSearchBar";
import { SkillsTab } from "./tabs/SkillsTab";
import { ExpertsTab } from "./tabs/ExpertsTab";
import { PluginsTab } from "./tabs/PluginsTab";
import { ConnectorsTab } from "./tabs/ConnectorsTab";
import { InstalledTab } from "./tabs/InstalledTab";

const { Title } = Typography;

const TABS = [
  { key: "skills", label: "Skills", icon: <ShoppingBag size={16} />, component: SkillsTab },
  { key: "experts", label: "Experts", icon: <Bot size={16} />, component: ExpertsTab },
  { key: "plugins", label: "Plugins", icon: <Puzzle size={16} />, component: PluginsTab },
  { key: "connectors", label: "Connectors", icon: <Plug size={16} />, component: ConnectorsTab },
  { key: "installed", label: "Installed", icon: <Download size={16} />, component: InstalledTab },
];

export const MarketPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("skills");
  const [search, setSearch] = useState("");

  const handleSearch = useCallback((val: string) => {
    setSearch(val);
  }, []);

  const currentTab = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const TabComponent = currentTab.component;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0, marginRight: 16 }}>
          {t("market.title", { defaultValue: "Marketplace" })}
        </Title>
        <MarketSearchBar
          value={search}
          onChange={handleSearch}
          placeholder={t("market.search.placeholder", { defaultValue: "Search the marketplace..." })}
        />
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={TABS.map(({ key, label, icon }) => ({
          key,
          label: (
            <Space>
              {icon}
              {t(`market.tabs.${key}`, { defaultValue: label })}
            </Space>
          ),
        }))}
      />

      <div style={{ marginTop: 16 }}>
        <TabComponent />
      </div>
    </div>
  );
};

export default MarketPage;