/**
 * useMarketList — loading + pagination for one market type list.
 */
import { useCallback, useEffect, useState } from "react";
import { message } from "antd";
import { useTranslation } from "react-i18next";
import { marketApi, type MarketItem } from "../../../api/modules/market";

export interface UseMarketListResult {
  items: MarketItem[];
  total: number;
  loading: boolean;
  error: string | null;
  reload: () => void;
  setPage: (page: number) => void;
  page: number;
  pageSize: number;
}

export function useMarketList(
  type: string,
  params: { q?: string; category?: string; sort?: string; pageSize?: number } = {},
): UseMarketListResult {
  const { t } = useTranslation();
  const [items, setItems] = useState<MarketItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = params.pageSize ?? 20;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await marketApi.list(type, {
        q: params.q,
        category: params.category,
        sort: params.sort,
        limit: pageSize,
        offset: (page - 1) * pageSize,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      message.error(t("market.errors.loadFailed", { defaultValue: "Failed to load" }));
    } finally {
      setLoading(false);
    }
  }, [type, params.q, params.category, params.sort, page, pageSize, t]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, total, loading, error, reload: load, setPage, page, pageSize };
}