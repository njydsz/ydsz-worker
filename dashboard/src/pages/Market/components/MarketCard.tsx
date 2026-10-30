import React from "react";
import { Card, Tag, Button, Tooltip } from "antd";
import { Check, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MarketItem } from "../../../api/modules/market";

interface Props {
  item: MarketItem;
  onInstall?: (item: MarketItem) => void;
  onDetail?: (item: MarketItem) => void;
}

export const MarketCard: React.FC<Props> = ({ item, onInstall, onDetail }) => {
  const { t } = useTranslation();
  const fallbackIcon = item.icon_name || "package";

  return (
    <Card
      hoverable
      style={{ height: "100%" }}
      onClick={() => onDetail?.(item)}
      cover={
        <div style={{
          height: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: item.color || "#f5f5f5",
          fontSize: 36,
        }}>
          {item.icon_url
            ? <img src={item.icon_url} alt={item.name} style={{ maxHeight: 60 }} />
            : <span>{fallbackIcon}</span>}
        </div>
      }
    >
      <Card.Meta
        title={item.name}
        description={
          <div>
            <p style={{ color: "#666", marginBottom: 8 }}>
              {item.description?.slice(0, 80) || ""}
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#999" }}>
                {item.author?.name || ""}
              </span>
              <span>{item.downloads} <small>installs</small></span>
            </div>
            {item.tags?.length > 0 && (
              <div style={{ marginTop: 6 }}>
                {item.tags.slice(0, 3).map((tag) => <Tag key={tag}>{tag}</Tag>)}
              </div>
            )}
          </div>
        }
      />
      <div style={{ marginTop: 8 }}>
        {item.installed ? (
          <Button type="link" icon={<Check size={14} />} disabled>
            {t("market.card.installed", { defaultValue: "Installed" })}
          </Button>
        ) : (
          <Button type="link" size="small" onClick={(e) => { e.stopPropagation(); onInstall?.(item); }}>
            {t("market.actions.install", { defaultValue: "Install" })}
          </Button>
        )}
        {item.has_update && <RefreshCw size={14} style={{ color: "#faad14" }} />}
      </div>
    </Card>
  );
};