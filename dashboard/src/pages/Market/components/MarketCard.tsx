import React from "react";
import { Card, Tag, Button, Typography, Space, Tooltip, Avatar } from "antd";
import { Download, Check, RefreshCw, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MarketItem } from "../../../api/modules/market";

const { Text, Title } = Typography;

interface Props {
  item: MarketItem;
  onInstall?: (item: MarketItem) => void;
  onDetail?: (item: MarketItem) => void;
}

const FALLBACK_COLORS = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16", "#52c41a", "#eb2f96", "#8c8c8c"];

function colorForIdentity(identity: string): string {
  let hash = 0;
  for (const ch of identity) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff;
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length];
}

export const MarketCard: React.FC<Props> = ({ item, onInstall, onDetail }) => {
  const { t } = useTranslation();
  const iconBg = item.color || colorForIdentity(item.identity);

  return (
    <Card
      hoverable
      onClick={() => onDetail?.(item)}
      style={{
        height: "100%",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #f0f0f0",
        transition: "all 0.2s ease",
      }}
      styles={{
        body: { padding: 16, flex: 1, display: "flex", flexDirection: "column" },
        actions: { borderTop: "1px solid #f5f5f5", padding: "8px 16px" },
      }}
      cover={
        <div
          style={{
            height: 80,
            background: `linear-gradient(135deg, ${iconBg}dd, ${iconBg}88)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {item.icon_url ? (
            <Avatar
              size={48}
              src={item.icon_url}
              style={{ background: "rgba(255,255,255,0.9)", borderRadius: 10 }}
            />
          ) : (
            <Avatar
              size={48}
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: 10,
                color: "#fff",
                fontSize: 22,
                fontWeight: 600,
              }}
            >
              {item.name.slice(0, 2).toUpperCase()}
            </Avatar>
          )}
        </div>
      }
    >
      {/* Title */}
      <Title level={5} ellipsis={{ tooltip: item.name }} style={{ marginBottom: 4 }}>
        {item.name}
      </Title>

      {/* Description */}
      <Text
        type="secondary"
        style={{ fontSize: 12, lineHeight: 1.5, flex: 1, minHeight: 36 }}
        ellipsis={{ tooltip: item.description || "No description" }}
      >
        {item.description || t("market.card.no_description", { defaultValue: "No description" })}
      </Text>

      {/* Meta row */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Space size={4}>
          {item.author?.name && (
            <Text type="secondary" style={{ fontSize: 11 }}>
              @{item.author.name}
            </Text>
          )}
        </Space>
        <Space size={6}>
          <Download size={12} color="#999" />
          <Text type="secondary" style={{ fontSize: 11 }}>
            {item.downloads.toLocaleString()}
          </Text>
          {item.rating && (
            <>
              <Star size={12} color="#faad14" fill="#faad14" />
              <Text type="secondary" style={{ fontSize: 11 }}>
                {item.rating.toFixed(1)}
              </Text>
            </>
          )}
        </Space>
      </div>

      {/* Tags */}
      {item.tags?.length > 0 && (
        <div style={{ marginTop: 8, minHeight: 22 }}>
          {item.tags.slice(0, 2).map((tag) => (
            <Tag key={tag} style={{ fontSize: 10, padding: "0 4px" }}>
              {tag}
            </Tag>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {item.installed ? (
          <Tooltip title={t("market.card.installed", { defaultValue: "Installed" })}>
            <Text type="success">
              <Check size={14} /> {t("market.card.installed")}
            </Text>
          </Tooltip>
        ) : (
          <Button
            type="primary"
            size="small"
            onClick={(e) => { e.stopPropagation(); onInstall?.(item); }}
          >
            {t("market.actions.install", { defaultValue: "Install" })}
          </Button>
        )}
        {item.has_update && (
          <Tooltip title={t("market.card.update_available", { defaultValue: "Update available" })}>
            <RefreshCw size={14} color="#faad14" />
          </Tooltip>
        )}
      </div>
    </Card>
  );
};
