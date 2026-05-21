import { prisma } from "@/lib/prisma"
import { formatTaskDisplayId } from "@/lib/constants/teams"
import type { TeamSlug } from "@/lib/constants/teams"
import {
  getSessionUser,
  taskWhereForUser,
  type BrowseContext,
} from "@/lib/auth/permissions"

export type TaskTableRow = {
  id: string
  displayId: number
  displayLabel: string
  title: string
  status: string
  priority: string
  dueDate: string | null
  projectName: string | null
  team: TeamSlug | null
  assigneeLabel: string
  createdByLabel: string
}

export async function getTasksTable(ctx: BrowseContext): Promise<TaskTableRow[]> {
  const user = await getSessionUser()
  if (!user) return []

  const tasks = await prisma.task.findMany({
    where: taskWhereForUser(user, ctx),
    orderBy: { updatedAt: "desc" },
    include: {
      assignee: { select: { name: true, email: true, team: true } },
      createdBy: { select: { name: true, email: true, team: true } },
      project: { select: { name: true, team: true } },
    },
  })

  return tasks.map((t) => ({
    id: t.id,
    displayId: t.displayId,
    displayLabel: formatTaskDisplayId(t.displayId),
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    projectName: t.project?.name ?? null,
    team: t.project?.team ?? null,
    assigneeLabel: t.assignee?.name?.trim() || t.assignee?.email || "Unassigned",
    createdByLabel: t.createdBy.name?.trim() || t.createdBy.email,
  }))
}
