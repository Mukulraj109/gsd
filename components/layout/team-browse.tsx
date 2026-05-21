"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { TEAM_LABELS, TEAMS, type TeamSlug } from "@/lib/constants/teams"
import { buildBrowseHrefFromSearch } from "@/lib/browse/build-browse-href"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  isAdmin: boolean
  accessibleTeams: TeamSlug[]
  memberTeam: TeamSlug | null
  canViewTeamBoard: boolean
}

export function TeamBrowse({
  isAdmin,
  accessibleTeams,
  memberTeam,
  canViewTeamBoard,
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [deniedOpen, setDeniedOpen] = useState(false)

  const scope = searchParams.get("scope")
  const teamRaw = searchParams.get("team")
  const teamParam =
    teamRaw && (TEAMS as readonly string[]).includes(teamRaw) ? (teamRaw as TeamSlug) : null

  const myTasksActive = !isAdmin && scope === "mine"
  const teamActive =
    !isAdmin && scope === "team" && memberTeam && teamParam === memberTeam

  function openDeniedDialog() {
    setDeniedOpen(true)
  }

  const deniedMessage = memberTeam
    ? `You don't have authority to view ${TEAM_LABELS[memberTeam]} tasks. Ask your lead to enable team board access on your account.`
    : "You don't have authority to view team tasks."

  if (isAdmin) {
    const viewAll = !teamRaw || teamRaw === "all"
    const allTeamsHref = buildBrowseHrefFromSearch(pathname, searchParams, {
      team: null,
      clearProject: true,
    })

    return (
      <div className="px-4 pb-2 pt-1">
        <p className="mb-2.5 px-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Browse by team
        </p>
        <div className="space-y-1">
          <Link
            href={allTeamsHref}
            className={cn(
              "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
              viewAll
                ? "bg-[var(--secondary)]/15 text-[var(--primary)]"
                : "text-[var(--text-body)] hover:bg-gray-100"
            )}
          >
            All teams
          </Link>
          {accessibleTeams.map((team) => {
            const active = !viewAll && teamParam === team
            const href = buildBrowseHrefFromSearch(pathname, searchParams, {
              team,
              clearProject: true,
            })
            return (
              <Link
                key={team}
                href={href}
                className={cn(
                  "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  active
                    ? "bg-[var(--secondary)]/15 text-[var(--primary)]"
                    : "text-[var(--text-body)] hover:bg-gray-100"
                )}
              >
                {TEAM_LABELS[team]}
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="px-4 pb-2 pt-1">
        <p className="mb-2.5 px-3 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Browse by team
        </p>
        <div className="space-y-1">
          <Link
            href={buildBrowseHrefFromSearch(pathname, searchParams, {
              scope: "mine",
              clearProject: true,
            })}
            className={cn(
              "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
              myTasksActive || (!scope && !teamParam)
                ? "bg-[var(--secondary)]/15 text-[var(--primary)]"
                : "text-[var(--text-body)] hover:bg-gray-100"
            )}
          >
            My tasks
          </Link>
          {memberTeam &&
            (canViewTeamBoard ? (
              <Link
                href={buildBrowseHrefFromSearch(pathname, searchParams, {
                  scope: "team",
                  team: memberTeam,
                  clearProject: true,
                })}
                className={cn(
                  "block rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  teamActive
                    ? "bg-[var(--secondary)]/15 text-[var(--primary)]"
                    : "text-[var(--text-body)] hover:bg-gray-100"
                )}
              >
                {TEAM_LABELS[memberTeam]}
              </Link>
            ) : (
              <button
                type="button"
                onClick={openDeniedDialog}
                className={cn(
                  "w-full rounded-lg px-4 py-2.5 text-left text-base font-medium transition-colors",
                  "text-[var(--text-body)] hover:bg-gray-100"
                )}
              >
                {TEAM_LABELS[memberTeam]}
              </button>
            ))}
        </div>
      </div>

      <Dialog open={deniedOpen} onOpenChange={setDeniedOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Access restricted</DialogTitle>
            <DialogDescription>{deniedMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" onClick={() => setDeniedOpen(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
