import Link from "next/link"
import { redirect } from "next/navigation"
import {
  getSessionUser,
  isAdmin,
  resolveBrowseContext,
} from "@/lib/auth/permissions"
import { getTasksTable } from "@/lib/queries/tasks-table"
import { TEAM_LABELS } from "@/lib/constants/teams"
import { buildBrowseHref } from "@/lib/browse/build-browse-href"
import { Badge } from "@/components/ui/badge"
import { statusToBadgeVariant, priorityLabel } from "@/lib/constants/tasks"
import { format } from "date-fns"
import { BoardAccessNotice } from "@/components/board/board-access-notice"

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
    <div className="space-y-8">
      <BoardAccessNotice
        accessDenied={ctx.accessDenied}
        deniedReason={ctx.deniedReason}
        memberTeam={user.team}
      />
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--heading)] lg:text-5xl">Task Table</h1>
        <p className="text-lg text-[var(--text-muted)]">{subtitle}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-white">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-[var(--heading)]">
              <th className="px-5 py-4 text-base font-semibold">ID</th>
              <th className="px-5 py-4 text-base font-semibold">Title</th>
              <th className="px-5 py-4 text-base font-semibold">Status</th>
              <th className="px-5 py-4 text-base font-semibold">Priority</th>
              <th className="px-5 py-4 text-base font-semibold">Assignee</th>
              <th className="px-5 py-4 text-base font-semibold">Created by</th>
              <th className="px-5 py-4 text-base font-semibold">Due</th>
              <th className="px-5 py-4 text-base font-semibold">Project</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-base text-[var(--text-muted)]">
                  No tasks in this view.
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-sm">{t.displayLabel}</td>
                  <td className="px-5 py-4">
                    <Link href={boardHref} className="font-semibold text-[var(--primary)] hover:underline">
                      {t.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={statusToBadgeVariant(t.status)}>{t.status.replaceAll("_", " ")}</Badge>
                  </td>
                  <td className="px-5 py-4">{priorityLabel(t.priority)}</td>
                  <td className="px-5 py-4">{t.assigneeLabel}</td>
                  <td className="px-5 py-4">{t.createdByLabel}</td>
                  <td className="px-5 py-4">
                    {t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-5 py-4">{t.projectName ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
