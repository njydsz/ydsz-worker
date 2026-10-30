import { useCallback, useEffect, useState } from "react";
import { marketApi } from "../../../api/modules/market";

export function useInstalledTab() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await marketApi.installed({});
      setItems(result.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { items, loading, reload: load };
}