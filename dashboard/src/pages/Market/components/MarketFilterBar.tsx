import React from "react";
import { Select, Radio, Space } from "antd";
import { useTranslation } from "react-i18next";
import type { Category } from "../../../api/modules/market";

interface Props {
  categories: Category[];
  category: string;
  onCategoryChange: (val: string) => void;
  sort: string;
  onSortChange: (val: string) => void;
}

export const MarketFilterBar: React.FC<Props> = ({
  categories,
  category,
  onCategoryChange,
  sort,
  onSortChange,
}) => {
  const { t } = useTranslation();
  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Select
        value={category || undefined}
        onChange={(v) => onCategoryChange(v ?? "")}
        placeholder={t("market.filters.category", { defaultValue: "Category" })}
        allowClear
        style={{ width: 180 }}
        options={[
          { value: "", label: t("market.filters.all_category", { defaultValue: "All" }) },
          ...categories.map((c) => ({ value: c.slug, label: c.label || c.slug })),
        ]}
      />
      <Radio.Group value={sort} onChange={(e) => onSortChange(e.target.value)}>
        <Radio.Button value="relevance">{t("market.filters.sortRelevance", { defaultValue: "Relevance" })}</Radio.Button>
        <Radio.Button value="downloads">{t("market.filters.sortDownloads", { defaultValue: "Popular" })}</Radio.Button>
        <Radio.Button value="rating">{t("market.filters.sortRating", { defaultValue: "Top Rated" })}</Radio.Button>
        <Radio.Button value="newest">{t("market.filters.sortNewest", { defaultValue: "Latest" })}</Radio.Button>
      </Radio.Group>
    </Space>
  );
};