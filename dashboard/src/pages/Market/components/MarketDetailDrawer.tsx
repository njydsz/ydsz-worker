import React from "react";
import { Drawer, Spin, Tag, Button, Divider, Typography } from "antd";
import { useTranslation } from "react-i18next";
import type { MarketDetail } from "../../../api/modules/market";

const { Title, Paragraph, Text } = Typography;

interface Props {
  detail: MarketDetail | null;
  loading: boolean;
  open: boolean;
  onClose: () => void;
  onInstall?: (detail: MarketDetail) => void;
}

export const MarketDetailDrawer: React.FC<Props> = ({
  detail,
  loading,
  open,
  onClose,
  onInstall,
}) => {
  const { t } = useTranslation();

  return (
    <Drawer
      title={detail?.name || t("market.title", { defaultValue: "Marketplace" })}
      placement="right"
      width={520}
      open={open}
      onClose={onClose}
    >
      {loading && <Spin />}
      {detail && !loading && (
        <div>
          <Title level={4}>{detail.name}</Title>
          <Text type="secondary">
            {detail.author?.name} · v{detail.version} · {detail.downloads} installs
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
              <Button disabled>{t("market.card.installed", { defaultValue: "Installed" })}</Button>
            ) : (
              <Button type="primary" onClick={() => onInstall?.(detail)}>
                {t("market.actions.install", { defaultValue: "Install" })}
              </Button>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
};