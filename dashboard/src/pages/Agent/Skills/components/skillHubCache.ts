import type { SkillHubSkill } from "./SkillHubDetailDrawer";
import type { SkillHubSource } from "./skillInstallTarget";

const RANKINGS_CACHE_PREFIX = "ydsz:skillhub-rankings:v1";
const RANKINGS_CACHE_TTL = 24 * 60 * 60 * 1000;

interface RankingsCache {
  ts: number;
  data: Record<string, SkillHubSkill[]>;
}

// One cache entry per marketplace — a shared key would show SkillHub cards
// after switching to Qoder until the entry expired.
function cacheKey(source: SkillHubSource): string {
  return `${RANKINGS_CACHE_PREFIX}:${source}`;
}

export function loadRankingsCache(
  source: SkillHubSource = "skillhub",
): Record<string, SkillHubSkill[]> | null {
  try {
    const raw = localStorage.getItem(cacheKey(source));
    if (!raw) return null;
    const parsed: RankingsCache = JSON.parse(raw);
    if (Date.now() - parsed.ts > RANKINGS_CACHE_TTL) {
      localStorage.removeItem(cacheKey(source));
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveRankingsCache(
  data: Record<string, SkillHubSkill[]>,
  source: SkillHubSource = "skillhub",
): void {
  try {
    const payload: RankingsCache = { ts: Date.now(), data };
    localStorage.setItem(cacheKey(source), JSON.stringify(payload));
  } catch {
    // localStorage may be full or unavailable; ignore silently.
  }
}
