import { useCallback, useState } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { marketApi, type InstallReceipt } from "../../../api/modules/market";

export function useMarketInstall() {
  const { t } = useTranslation();
  const [installing, setInstalling] = useState(false);
  const [receipt, setReceipt] = useState<InstallReceipt | null>(null);

  const install = useCallback(async (
    type: string,
    identity: string,
    body: Record<string, unknown>,
  ): Promise<InstallReceipt | null> => {
    setInstalling(true);
    try {
      const result = await marketApi.install(type, identity, body);
      setReceipt(result);
      message.success(t("market.actions.install", { defaultValue: "Install" }) + " OK");
      return result;
    } catch (err: unknown) {
      message.error(t("market.errors.installFailed", { defaultValue: "Installation failed" }));
      return null;
    } finally {
      setInstalling(false);
    }
  }, [t]);

  return { installing, receipt, install };
}