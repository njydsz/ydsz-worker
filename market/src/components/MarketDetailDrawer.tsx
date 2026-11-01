import React from "react";
import { Drawer, Spin, Tag, Button, Divider, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { MarketItem } from "../api/market";

const { Title, Paragraph, Text } = Typography;

interface Props {
  detail: MarketItem | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onInstall?: (detail: MarketItem) => void;
  dashboardUrl?: string;
}

export const MarketDetailDrawer: React.FC<Props> = ({
  detail,
  loading,
  open,
  onClose,
  onInstall,
  dashboardUrl,
}) => {
  const { t } = useTranslation();

  return (
    <Drawer
      title={detail?.name || t("market.title")}
      placement="right"
      width={Math.min(520, window.innerWidth - 32)}
      open={open}
      onClose={onClose}
    >
      {loading && <Spin />}
      {detail && !loading && (
        <div>
          <Title level={4}>{detail.name}</Title>
          <Text type="secondary">
            {detail.author?.name} · v{detail.version} · {detail.downloads.toLocaleString()} installs
          </Text>
          <Divider />
          <Paragraph>{detail.description}</Paragraph>
          {detail.tags?.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              {detail.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            </div>
          )}
          {detail.readme && (
            <>
              <Divider />
              <div style={{ whiteSpace: "pre-wrap", fontSize: 13 }}>{detail.readme}</div>
            </>
          )}
          <Divider />
          <div style={{ textAlign: "right" }}>
            {detail.installed ? (
              <Button disabled>{t("market.card.installed")}</Button>
            ) : dashboardUrl ? (
              <Button type="primary" href={dashboardUrl} target="_blank" rel="noopener">
                {t("auth.go_to_dashboard")} →
              </Button>
            ) : (
              <Button type="primary" onClick={() => onInstall?.(detail)}>
                {t("market.actions.install")}
              </Button>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};
