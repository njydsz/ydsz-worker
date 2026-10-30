import { useCallback, useEffect, useState } from "react";
import { marketApi, type Category } from "../../../api/modules/market";

export function useMarketCategories(type: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await marketApi.categories(type);
      setCategories(result.categories);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  return { categories, loading, reload: load };
}