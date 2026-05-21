"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { BROWSE_ALL_PROJECTS } from "@/lib/constants/browse"
import { buildBrowseHrefFromSearch } from "@/lib/browse/build-browse-href"
import { TEAM_LABELS, TEAMS, type TeamSlug } from "@/lib/constants/teams"

export type SidebarProject = {
  id: string
  name: string
  team: TeamSlug
}

type Props = {
  isAdmin: boolean
  memberTeam: TeamSlug | null
  projects: SidebarProject[]
}

export function ProjectBrowse({ isAdmin, memberTeam, projects }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const teamRaw = searchParams.get("team")
  const teamParam =
    teamRaw && (TEAMS as readonly string[]).includes(teamRaw) ? (teamRaw as TeamSlug) : null
  const projectParam = searchParams.get("project")
  const scope = searchParams.get("scope")

  const effectiveTeam: TeamSlug | null = isAdmin
    ? teamParam
    : memberTeam

  const teamProjects = effectiveTeam
    ? projects.filter((p) => p.team === effectiveTeam)
    : []

  const viewAllProjects = !projectParam || projectParam === BROWSE_ALL_PROJECTS

  if (isAdmin && !effectiveTeam) {
    return (
      <div className="px-4 pb-2 pt-1">
        <p className="mb-2.5 px-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Browse by project
        </p>
        <p className="rounded-lg px-4 py-2.5 text-sm text-[var(--text-muted)]">
          Select a team to browse projects.
        </p>
      </div>
    )
  }

  if (!effectiveTeam) {
    return null
  }

  const allProjectsHref = buildBrowseHrefFromSearch(pathname, searchParams, {
    team: effectiveTeam,
    scope: isAdmin ? undefined : ((scope as "mine" | "team" | undefined) ?? "mine"),
    project: null,
  })

  return (
    <div className="px-4 pb-2 pt-1">
      <p className="mb-2.5 px-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
        Browse by project
      </p>
      <p className="mb-2 px-3 text-xs text-[var(--text-muted)]">
        {TEAM_LABELS[effectiveTeam]}
      </p>
      <div className="space-y-1">
        <Link
          href={allProjectsHref}
          className={cn(
            "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
            viewAllProjects
              ? "bg-[var(--secondary)]/15 text-[var(--primary)]"
              : "text-[var(--text-body)] hover:bg-gray-100"
          )}
        >
          All projects
        </Link>
        {teamProjects.length === 0 ? (
          <p className="px-4 py-2 text-sm text-[var(--text-muted)]">No projects yet.</p>
        ) : (
          teamProjects.map((p) => {
            const active = projectParam === p.id
            const href = buildBrowseHrefFromSearch(pathname, searchParams, {
              team: effectiveTeam,
              scope: isAdmin ? undefined : (scope as "mine" | "team" | undefined),
              project: p.id,
            })
            return (
              <Link
                key={p.id}
                href={href}
                className={cn(
                  "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  active
                    ? "bg-[var(--secondary)]/15 text-[var(--primary)]"
                    : "text-[var(--text-body)] hover:bg-gray-100"
                )}
              >
                {p.name}
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
