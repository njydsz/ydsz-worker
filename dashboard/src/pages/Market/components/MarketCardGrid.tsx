import React from "react";
import { Row, Col, Empty, Spin } from "antd";
import { MarketCard } from "./MarketCard";
import type { MarketItem } from "../../../api/modules/market";

interface Props {
  items: MarketItem[];
  loading?: boolean;
  onInstall?: (item: MarketItem) => void;
  onDetail?: (item: MarketItem) => void;
}

export const MarketCardGrid: React.FC<Props> = ({ items, loading, onInstall, onDetail }) => {
  if (loading) {
    return <div style={{ padding: 60, textAlign: "center" }}><Spin size="large" /></div>;
  }
  if (!items.length) {
    return <Empty description="No results" style={{ padding: 60 }} />;
  }
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.market_id} xs={24} sm={12} md={8} lg={6} xl={6}>
          <MarketCard item={item} onInstall={onInstall} onDetail={onDetail} />
        </Col>
      ))}
    </Row>
  );
};