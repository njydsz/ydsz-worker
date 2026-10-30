import React, { useState, useCallback } from "react";
import { Pagination, Modal, Form, Input, Select } from "antd";
import { useTranslation } from "react-i18next";
import { useMarketList } from "../hooks/useMarketList";
import { useMarketCategories } from "../hooks/useMarketCategories";
import { useMarketInstall } from "../hooks/useMarketInstall";
import { MarketCardGrid } from "../components/MarketCardGrid";
import { MarketFilterBar } from "../components/MarketFilterBar";
import type { MarketItem } from "../../../api/modules/market";

export const ConnectorsTab: React.FC = () => {
  const { t } = useTranslation();
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const { categories } = useMarketCategories("connector");
  const { items, total, loading } = useMarketList("connector", {
    category: category || undefined, sort, pageSize,
  });
  const { installing, install } = useMarketInstall();

  const handleAuthorize = useCallback((item: MarketItem) => {
    Modal.confirm({
      title: `${t("market.connector.authorize", { defaultValue: "Authorize" })} ${item.name}`,
      content: (
        <Form layout="vertical">
          <Form.Item label={t("market.connector.client_id_label", { defaultValue: "Client ID" })}>
            <Input />
          </Form.Item>
          <Form.Item label={t("market.connector.client_secret_label", { defaultValue: "Client Secret" })}>
            <Input.Password />
          </Form.Item>
        </Form>
      ),
      onOk: async () => {
        await install("connector", item.identity, {
          target_type: "connector_instance",
          target_id: item.identity,
        });
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
      <MarketCardGrid items={items} loading={loading} onInstall={handleAuthorize} />
      {total > pageSize && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Pagination current={page} pageSize={pageSize} total={total}
            onChange={(p) => setPage(p)} />
        </div>
      )}
    </div>
  );
};