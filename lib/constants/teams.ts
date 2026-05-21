export const TEAMS = ["DEV", "OPS", "CORE"] as const
export type TeamSlug = (typeof TEAMS)[number]

export const TEAM_LABELS: Record<TeamSlug, string> = {
  DEV: "Dev Team",
  OPS: "Ops Team",
  CORE: "Core Team",
}

/** Shown in admin UI when role is ADMIN (stored as null team in the database). */
export const ADMIN_ALL_TEAMS_LABEL = "All teams"

export type BrowseScope = "mine" | "team"

export function parseTeamParam(value: string | string[] | undefined): TeamSlug | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw && TEAMS.includes(raw as TeamSlug)) return raw as TeamSlug
  return null
}

export function parseBrowseScope(value: string | string[] | undefined): BrowseScope | null {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === "mine" || raw === "team") return raw
  return null
}

/** Default team for admin when URL omits team (must match sidebar highlight). */
export function defaultAdminTeam(): TeamSlug {
  return TEAMS[0]
}

export function formatTaskDisplayId(displayId: number) {
  return `GSD-${displayId}`
}
