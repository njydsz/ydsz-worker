import React, { useState, useCallback } from "react";
import { Pagination, Modal, Input, message } from "antd";
import { useTranslation } from "react-i18next";
import { useMarketList } from "../hooks/useMarketList";
import { useMarketCategories } from "../hooks/useMarketCategories";
import { useMarketInstall } from "../hooks/useMarketInstall";
import { MarketCardGrid } from "../components/MarketCardGrid";
import { MarketFilterBar } from "../components/MarketFilterBar";
import type { MarketItem } from "../../../api/modules/market";

export const ExpertsTab: React.FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("downloads");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { categories } = useMarketCategories("expert");
  const { items, total, loading } = useMarketList("expert", {
    category: category || undefined, sort, pageSize,
  });
  const { installing, install } = useMarketInstall();

  const handleInstall = useCallback((item: MarketItem) => {
    let name = item.name;
    Modal.confirm({
      title: t("market.install.name_label", { defaultValue: "Create Agent" }),
      content: (
        <div>
          <Input defaultValue={item.name}
            onChange={(e) => { name = e.target.value; }}
            placeholder={t("market.install.name_placeholder", { defaultValue: "Agent name" })} />
        </div>
      ),
      onOk: async () => {
        await install("expert", item.identity, { name, target_type: "agent", target_id: "new" });
        message.success("Agent created from expert");
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