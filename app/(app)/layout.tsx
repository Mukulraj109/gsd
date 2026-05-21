import { Suspense } from "react"
import { redirect } from "next/navigation"
import {
  getSessionUser,
  getBrowsableTeams,
  canViewTeamBoard,
  isAdmin,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"
import { Sidebar } from "@/components/layout/Sidebar"
import { AppHeader } from "@/components/layout/app-header"

type Props = {
  children: React.ReactNode
}

export default async function AppLayout({ children }: Props) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const admin = isAdmin(user)

  const projects = await prisma.project.findMany({
    where: admin
      ? {}
      : user.team
        ? { team: user.team }
        : { id: "never" },
    select: { id: true, name: true, team: true },
    orderBy: { name: "asc" },
  })

  return (
    <div className="flex h-screen overflow-hidden">
      <Suspense fallback={null}>
        <Sidebar
          isAdmin={admin}
          accessibleTeams={getBrowsableTeams(user)}
          memberTeam={user.team}
          canViewTeamBoard={canViewTeamBoard(user)}
          projects={projects.map((p) => ({
            id: p.id,
            name: p.name,
            team: p.team,
          }))}
        />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader pageTitle="Get Stuff Done" />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--background)] p-6 lg:p-8 xl:p-10">
          <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col min-h-0">{children}</div>
        </main>
      </div>
    </div>
  )
}
