import React, { useState, useCallback } from "react";
import { Pagination, Modal, Select, message } from "antd";
import { useTranslation } from "react-i18next";
import { useMarketList } from "../hooks/useMarketList";
import { useMarketCategories } from "../hooks/useMarketCategories";
import { useMarketInstall } from "../hooks/useMarketInstall";
import { MarketCardGrid } from "../components/MarketCardGrid";
import { MarketFilterBar } from "../components/MarketFilterBar";
import type { MarketItem } from "../../../api/modules/market";

export const SkillsTab: React.FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("downloads");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { categories } = useMarketCategories("skill");
  const { items, total, loading } = useMarketList("skill", {
    category: category || undefined,
    sort,
    pageSize,
  });
  const { installing, install } = useMarketInstall();

  const handleInstall = useCallback((item: MarketItem) => {
    Modal.confirm({
      title: t("market.install.select_agent", { defaultValue: "Choose Agent" }),
      content: (
        <Select placeholder="Select agent" style={{ width: "100%" }}
          options={[{ value: "default", label: "Default Agent" }]} />
      ),
      onOk: async () => {
        await install("skill", item.identity, { target_type: "agent", target_id: "default" });
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