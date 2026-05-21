import type { BrowseScope } from "@/lib/constants/teams"
import type { TeamSlug } from "@/lib/constants/teams"
import { BROWSE_ALL_PROJECTS } from "@/lib/constants/browse"

export type BrowseHrefParams = {
  team?: TeamSlug | "all" | null
  project?: string | null
  scope?: BrowseScope
  /** When true, omit project from URL (e.g. team change). */
  clearProject?: boolean
}

export function buildBrowseHref(pathname: string, params: BrowseHrefParams = {}): string {
  const qs = new URLSearchParams()

  if (params.scope) {
    qs.set("scope", params.scope)
  }

  if (params.team && params.team !== "all") {
    qs.set("team", params.team)
  }

  if (!params.clearProject && params.project) {
    qs.set("project", params.project)
  }

  const s = qs.toString()
  return s ? `${pathname}?${s}` : pathname
}

/** Preserve current browse params from URLSearchParams, with overrides. */
export function buildBrowseHrefFromSearch(
  pathname: string,
  searchParams: URLSearchParams,
  overrides: BrowseHrefParams = {}
): string {
  const scope = (searchParams.get("scope") as BrowseScope | null) ?? undefined
  const teamRaw = searchParams.get("team")
  const team = overrides.team !== undefined
    ? overrides.team
    : teamRaw
      ? (teamRaw as TeamSlug | "all")
      : null
  const project = overrides.clearProject
    ? null
    : overrides.project !== undefined
      ? overrides.project
      : searchParams.get("project")

  return buildBrowseHref(pathname, {
    scope: overrides.scope ?? scope ?? undefined,
    team: team === null ? undefined : team,
    project: project && project !== BROWSE_ALL_PROJECTS ? project : null,
    clearProject: overrides.clearProject,
  })
}
