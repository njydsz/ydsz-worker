import React, { useState, useCallback } from "react";
import { Pagination, Modal, message } from "antd";
import { useTranslation } from "react-i18next";
import { useMarketList } from "../hooks/useMarketList";
import { useMarketCategories } from "../hooks/useMarketCategories";
import { useMarketInstall } from "../hooks/useMarketInstall";
import { MarketCardGrid } from "../components/MarketCardGrid";
import { MarketFilterBar } from "../components/MarketFilterBar";
import type { MarketItem } from "../../../api/modules/market";

export const PluginsTab: React.FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { categories } = useMarketCategories("plugin");
  const { items, total, loading } = useMarketList("plugin", {
    category: category || undefined, sort, pageSize,
  });
  const { installing, install } = useMarketInstall();

  const handleInstall = useCallback((item: MarketItem) => {
    Modal.confirm({
      title: `${t("market.actions.install", { defaultValue: "Install" })} ${item.name}?`,
      onOk: async () => {
        await install("plugin", item.identity, { target_type: "plugin_dir", target_id: item.identity });
      },
    });
  }, [install, t]);

  return (
    <div>
      <MarketFilterBar
        categories={categories}
        category={category}
        onCategoryChange={(v) => { setCategory(v); setPage(1); }}
        sort={sort}
        onSortChange={(v) => { setSort(v); setPage(1); }}
      />
      <MarketCardGrid items={items} loading={loading} onInstall={handleInstall} />
      {total > pageSize && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Pagination current={page} pageSize={pageSize} total={total}
            onChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};