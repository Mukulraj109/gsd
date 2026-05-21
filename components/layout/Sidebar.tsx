"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Kanban, Table2, Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TeamBrowse } from "@/components/layout/team-browse"
import { ProjectBrowse, type SidebarProject } from "@/components/layout/project-browse"
import { buildBrowseHref, buildBrowseHrefFromSearch } from "@/lib/browse/build-browse-href"
import type { BrowseScope, TeamSlug } from "@/lib/constants/teams"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Task Board", href: "/board", icon: Kanban },
  { name: "Task Table", href: "/tasks", icon: Table2 },
]

type Props = {
  isAdmin: boolean
  accessibleTeams: TeamSlug[]
  memberTeam: TeamSlug | null
  canViewTeamBoard: boolean
  projects: SidebarProject[]
}

export function Sidebar({
  isAdmin,
  accessibleTeams,
  memberTeam,
  canViewTeamBoard,
  projects,
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const user = session?.user
  const label = user?.name ?? user?.email ?? "User"
  const initials = label
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function navHref(href: string) {
    if (isAdmin) {
      return buildBrowseHrefFromSearch(href, searchParams)
    }
    const scope = (searchParams.get("scope") as BrowseScope | null) ?? "mine"
    const team = searchParams.get("team") as TeamSlug | null
    const project = searchParams.get("project")
    return buildBrowseHref(href, {
      scope: scope === "team" && team ? "team" : "mine",
      team: scope === "team" && team ? team : undefined,
      project: project || undefined,
    })
  }

  return (
    <div className="flex h-screen w-[17.5rem] shrink-0 flex-col border-r border-[var(--border)] bg-white lg:w-80">
      <div className="overflow-hidden border-b border-[var(--border)] px-3 py-2">
        <Link href="/dashboard" className="block leading-none">
          <Image
            src="/brand/fst-logo.png"
            alt="FirstStep"
            width={320}
            height={112}
            className="-my-2 -ml-1 h-28 max-w-[calc(100%+0.5rem)] object-contain object-left lg:h-36"
            style={{ width: "auto" }}
            priority
          />
        </Link>
      </div>

      <TeamBrowse
        isAdmin={isAdmin}
        accessibleTeams={accessibleTeams}
        memberTeam={memberTeam}
        canViewTeamBoard={canViewTeamBoard}
      />

      <ProjectBrowse
        isAdmin={isAdmin}
        memberTeam={memberTeam}
        projects={projects}
      />

      <nav className="flex-1 space-y-1.5 px-4 py-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={navHref(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                isActive ? "bg-[var(--primary)] text-white" : "text-[var(--text-body)] hover:bg-gray-100"
              )}
            >
              <item.icon className="h-6 w-6 shrink-0" />
              {item.name}
            </Link>
          )
        })}
        {isAdmin && (
          <Link
            href="/admin/gate"
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
              pathname.startsWith("/admin")
                ? "bg-[var(--footer-dark)] text-white"
                : "text-[var(--text-body)] hover:bg-gray-100"
            )}
          >
            <Shield className="h-6 w-6 shrink-0" />
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="space-y-3 border-t border-[var(--border)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] text-white text-base font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-[var(--text-body)]">{label}</p>
            <p className="truncate text-sm text-[var(--text-muted)]">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-11 w-full gap-2 text-base"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
