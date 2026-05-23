import { redirect } from "next/navigation"
import {
  getSessionUser,
  isAdmin,
  resolveBrowseContext,
} from "@/lib/auth/permissions"
import { getTasksTable } from "@/lib/queries/tasks-table"
import { TEAM_LABELS } from "@/lib/constants/teams"
import { buildBrowseHref } from "@/lib/browse/build-browse-href"
import { BoardAccessNotice } from "@/components/board/board-access-notice"
import { TasksTableView } from "@/components/tasks/tasks-table-view"

type Props = {
  searchParams: Promise<{ team?: string; scope?: string; project?: string }>
}

export default async function TasksTablePage({ searchParams }: Props) {
  const user = await getSessionUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const ctx = await resolveBrowseContext(user, params)
  const tasks = await getTasksTable(ctx)

  const admin = isAdmin(user)
  const subtitle = admin
    ? ctx.activeProjectName
      ? `Tasks in ${ctx.activeProjectName} (${TEAM_LABELS[ctx.team!]}).`
      : ctx.team
        ? `Tasks for ${TEAM_LABELS[ctx.team]}. Select a project in the sidebar to filter further.`
        : "All tasks across every team. Open the board to edit in Kanban view."
    : ctx.activeProjectName
      ? `Tasks in ${ctx.activeProjectName}.`
      : ctx.scope === "mine"
        ? "Tasks assigned to you."
        : ctx.team
          ? `All tasks for ${TEAM_LABELS[ctx.team]}. Open the board to edit in Kanban view.`
          : "Tasks you can access."

  const boardHref = admin
    ? buildBrowseHref("/board", {
        team: ctx.team ?? undefined,
        project: ctx.projectId ?? undefined,
      })
    : buildBrowseHref("/board", {
        scope: ctx.scope === "team" ? "team" : "mine",
        team: ctx.scope === "team" && ctx.team ? ctx.team : undefined,
        project: ctx.projectId ?? undefined,
      })

  return (
    <div className="space-y-6 sm:space-y-8">
      <BoardAccessNotice
        accessDenied={ctx.accessDenied}
        deniedReason={ctx.deniedReason}
        memberTeam={user.team}
      />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--heading)] sm:text-4xl lg:text-5xl">
          Task Table
        </h1>
        <p className="text-base text-[var(--text-muted)] sm:text-lg">{subtitle}</p>
      </div>
      <TasksTableView tasks={tasks} boardHref={boardHref} />
    </div>
  )
}
