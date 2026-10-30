import { useCallback, useState } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { marketApi, type MarketDetail } from "../../../api/modules/market";

export function useMarketDetail() {
  const { t } = useTranslation();
  const [detail, setDetail] = useState<MarketDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (type: string, identity: string) => {
    setLoading(true);
    try {
      const result = await marketApi.detail(type, identity);
      setDetail(result);
    } catch (err: unknown) {
      message.error(t("market.errors.loadFailed", { defaultValue: "Failed to load detail" }));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const reset = useCallback(() => setDetail(null), []);

  return { detail, loading, load, reset };
}