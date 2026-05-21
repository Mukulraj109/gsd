import { redirect } from "next/navigation"
import {
  getSessionUser,
  isAdmin,
  projectWhereForUser,
  memberUserWhereForUser,
  resolveBrowseContext,
} from "@/lib/auth/permissions"
import { prisma } from "@/lib/prisma"
import { getBoardTasks } from "@/lib/queries/board"
import { BoardClient } from "@/components/board/board-client"
import { BoardAccessNotice } from "@/components/board/board-access-notice"
type Props = {
  searchParams: Promise<{ team?: string; scope?: string; project?: string }>
}

export default async function BoardPage({ searchParams }: Props) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const ctx = await resolveBrowseContext(user, params)
  const admin = isAdmin(user)

  const [tasks, projects, members] = await Promise.all([
    getBoardTasks(ctx),
    prisma.project.findMany({
      where: projectWhereForUser(user, ctx),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.user.findMany({
      where: memberUserWhereForUser(user, ctx),
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ])
  const projectNames = [...new Set(projects.map((p) => p.name))]

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BoardAccessNotice
        accessDenied={ctx.accessDenied}
        deniedReason={ctx.deniedReason}
        memberTeam={user.team}
      />
      <BoardClient
        initialTasks={tasks}
        projectNames={projectNames}
        members={members}
        projects={projects}
        browseProjectId={ctx.projectId}
      />
    </div>
  )
}
