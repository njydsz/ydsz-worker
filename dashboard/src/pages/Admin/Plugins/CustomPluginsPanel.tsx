import { Empty } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

export function CustomPluginsPanel() {
  const { t } = useTranslation();

  return (
    <div className={styles.panel}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div className={styles.emptyWithAction}>
            <div>{t("plugins.customEmpty")}</div>
            <div className={styles.emptyHint}>{t("plugins.customEmptyHint")}</div>
          </div>
        }
      />
    </div>
  );
}
