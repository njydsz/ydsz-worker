import React from "react";
import { Empty, Spin, List, Button } from "antd";
import { useTranslation } from "react-i18next";
import { useInstalledTab } from "../hooks/useInstalledTab";

export const InstalledTab: React.FC = () => {
  const { t } = useTranslation();
  const { items, loading } = useInstalledTab();

  if (loading) return <Spin size="large" style={{ padding: 60 }} />;
  if (!items.length) return (
    <Empty
      description={t("market.installed.empty", { defaultValue: "You haven't installed anything yet" })}
    />
  );

  return (
    <List
      dataSource={items}
      renderItem={(item: Record<string, unknown>) => (
        <List.Item
          actions={[
            <Button size="small" key="update">Update</Button>,
            <Button size="small" danger key="uninstall">Uninstall</Button>,
          ]}
        >
          <List.Item.Meta
            title={String(item.market_id || "")}
            description={`${item.target_type} · ${item.installed_version}`}
          />
        </List.Item>
      )}
    />
  );
};