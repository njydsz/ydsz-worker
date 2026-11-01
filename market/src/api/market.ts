/**
 * Market API client — public, No JWT required.
 * Base URL is empty (same-origin) so the SPA talks to its own uvicorn process.
 */

export const BASE_URL = (import.meta as any).env?.BASE_URL ?? "";

export interface MarketAuthor {
  name: string;
  url?: string;
}

export interface MarketItem {
  market_id: string;
  type: string;
  source: string;
  identity: string;
  name: string;
  description: string;
  icon_url?: string | null;
  icon_name?: string | null;
  color?: string | null;
  version: string;
  category: string;
  tags: string[];
  rating?: number | null;
  downloads: number;
  installed: boolean;
  installed_version?: string | null;
  has_update: boolean;
  size_bytes?: number | null;
  source_url?: string | null;
  updated_at?: string | null;
  author?: MarketAuthor | null;
  /** Detail-only fields */
  readme?: string | null;
  screenshots?: string[];
  changelog?: string | null;
  dependencies?: string[];
  quick_prompts?: string[];
  metadata?: Record<string, unknown>;
}

export interface MarketListResult {
  items: MarketItem[];
  total: number;
  limit: number;
  offset: number;
  sort: string;
  category?: string | null;
  type?: string;
}

export interface CategoryFacet {
  slug: string;
  label?: string;
}

export interface InstallReceipt {
  market_item: MarketItem;
  target: { type: string; id: string };
  installed_version: string;
  snapshot_id: string;
  metadata?: Record<string, unknown>;
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail =
      body && typeof body === "object" && "detail" in body
        ? String((body as any).detail)
        : `HTTP ${res.status}`;
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null || v === "") continue;
    sp.set(k, String(v));
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export const marketApi = {
  /** Cross-type aggregated search. */
  search: (q: string, types?: string[], category?: string, sort = "relevance", limit = 24, offset = 0) =>
    request<MarketListResult>(
      `/api/market/search${buildQuery({ q, types: types?.join(","), category, sort, limit, offset })}`,
    ),

  /** Browse / list one market type. */
  list: (type: string, params: { q?: string; category?: string; sort?: string; limit?: number; offset?: number } = {}) =>
    request<MarketListResult>(
      `/api/market/${type}/list${buildQuery(params as any)}`,
    ),

  /** Full detail for one item. */
  detail: (type: string, identity: string) =>
    request<MarketItem>(`/api/market/${type}/${identity}`),

  /** Categories / facets for one type. */
  categories: (type: string) =>
    request<{ categories: CategoryFacet[]; type: string }>(`/api/market/${type}/categories`),

  /** Installed items (usually empty for public/unauthenticated users). */
  installed: (limit = 48, offset = 0) =>
    request<MarketListResult>(`/api/market/installed${buildQuery({ limit, offset })}`),

  /** Public install-info endpoint — returns dashboard URL and instructions. */
  installInfo: (type: string, identity: string) =>
    request<{ ok: true; dashboard_url: string; message: string }>(
      `/api/market/${type}/${identity}/install-info`,
    ),
};
