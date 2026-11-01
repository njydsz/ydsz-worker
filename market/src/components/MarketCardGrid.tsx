import React from "react";
import { Empty, Spin } from "antd";
import { MarketCard } from "./MarketCard";
import type { MarketItem } from "../api/market";

interface Props {
  items: MarketItem[];
  loading?: boolean;
  onInstall?: (item: MarketItem) => void;
  onDetail?: (item: MarketItem) => void;
  columns?: { xs: number; sm: number; md: number; lg: number; xl: number };
}

export const MarketCardGrid: React.FC<Props> = ({ items, loading, onInstall, onDetail, columns }) => {
  if (loading) {
    return <div style={{ padding: 80, textAlign: "center" }}><Spin size="large" /></div>;
  }
  if (!items.length) {
    return <Empty description="No results" style={{ padding: 60 }} />;
  }

  const gridTemplate = columns
    ? `repeat(auto-fill, minmax(${Math.floor(100 / columns.lg * 100) / 100 + 200}px, 1fr))`
    : "repeat(auto-fill, minmax(260px, 1fr))";

  return (
    <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: 16 }}>
      {items.map((item) => (
        <MarketCard key={item.market_id} item={item} onInstall={onInstall} onDetail={onDetail} />
      ))}
    </div>
  );
};
