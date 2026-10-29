/** Shared install destination for skill market / URL import UI. */

export type SkillInstallTarget =
  | { type: "agent"; agentId: string }
  | { type: "package"; packageId: string }
  | { type: "browse" };

/**
 * Marketplaces the hub tab can browse; all speak the same card shape.
 * ``seed`` is the bundled offline snapshot, installed from Qoder on demand.
 */
export type SkillHubSource = "skillhub" | "qoder" | "seed";

export function skillHubRankingsPath(
  target: SkillInstallTarget,
  source: SkillHubSource = "skillhub",
): string {
  if (target.type === "browse") {
    return `/skills/hub/rankings?type=all&source=${source}`;
  }
  if (target.type === "agent") {
    return `/agents/${target.agentId}/skills/hub/rankings?type=all&source=${source}`;
  }
  return `/skill-packages/hub/rankings?type=all&source=${source}`;
}

export function skillHubSearchPath(
  target: SkillInstallTarget,
  query: string,
  limit = 50,
  source: SkillHubSource = "skillhub",
): string {
  const q = encodeURIComponent(query);
  if (target.type === "browse") {
    return `/skills/hub/search?q=${q}&limit=${limit}&source=${source}`;
  }
  if (target.type === "agent") {
    return `/agents/${target.agentId}/skills/hub/search?q=${q}&limit=${limit}&source=${source}`;
  }
  return `/skill-packages/hub/search?q=${q}&limit=${limit}&source=${source}`;
}

export function skillHubInstallPath(target: SkillInstallTarget): string {
  if (target.type === "browse") {
    throw new Error("SkillHub browse target cannot install");
  }
  if (target.type === "agent") {
    return `/agents/${target.agentId}/skills/hub/install`;
  }
  return `/skill-packages/${target.packageId}/skills/hub/install`;
}

export function skillListPath(target: SkillInstallTarget): string {
  if (target.type === "browse") {
    throw new Error("SkillHub browse target has no installed list");
  }
  if (target.type === "agent") {
    return `/agents/${target.agentId}/skills`;
  }
  return `/skill-packages/${target.packageId}/skills`;
}
