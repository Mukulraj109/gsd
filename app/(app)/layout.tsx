import { redirect } from "next/navigation"
import {
  getSessionUser,
  getBrowsableTeams,
  canViewTeamBoard,
  isAdmin,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"
import { AppShell } from "@/components/layout/app-shell"
import type { SidebarProps } from "@/components/layout/Sidebar"

type Props = {
  children: React.ReactNode
}

export default async function AppLayout({ children }: Props) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const admin = isAdmin(user)

  const projects = await prisma.project.findMany({
    where: admin ? {} : user.team ? { team: user.team } : { id: "never" },
    select: { id: true, name: true, team: true },
    orderBy: { name: "asc" },
  })

  const sidebarProps: SidebarProps = {
    isAdmin: admin,
    accessibleTeams: getBrowsableTeams(user),
    memberTeam: user.team,
    canViewTeamBoard: canViewTeamBoard(user),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      team: p.team,
    })),
  }

  return <AppShell sidebarProps={sidebarProps}>{children}</AppShell>
}
