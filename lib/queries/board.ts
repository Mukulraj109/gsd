import { prisma } from "@/lib/prisma"
import { BOARD_STATUSES, type BoardStatus } from "@/lib/constants/tasks"
import { formatTaskDisplayId, type TeamSlug } from "@/lib/constants/teams"
import {
  getSessionUser,
  taskWhereForUser,
  type BrowseContext,
} from "@/lib/auth/permissions"

export type BoardTaskRow = {
  id: string
  displayId: number
  displayLabel: string
  title: string
  description: string | null
  status: BoardStatus
  priority: string
  position: number
  dueDate: string | null
  assigneeId: string | null
  createdById: string
  assignee: { name: string | null; initials: string } | null
  createdBy: { id: string; label: string; initials: string } | null
  projectName: string | null
  projectTeam: TeamSlug | null
  assigneeTeam: TeamSlug | null
  createdByTeam: TeamSlug | null
  commentCount: number
  attachmentCount: number
}

function initials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    return name
      .split(/\s+/)
      .map((p) => p[0])
      .join("")
      .slice(0, 3)
      .toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

export async function getBoardTasks(ctx: BrowseContext): Promise<BoardTaskRow[]> {
  const user = await getSessionUser()
  if (!user) return []

  const tasks = await prisma.task.findMany({
    where: taskWhereForUser(user, ctx),
    orderBy: [{ status: "asc" }, { position: "asc" }],
    include: {
      assignee: { select: { id: true, name: true, email: true, team: true } },
      createdBy: { select: { id: true, name: true, email: true, team: true } },
      project: { select: { name: true, team: true } },
      _count: { select: { comments: true, attachments: true } },
    },
  })

  const order = new Map(BOARD_STATUSES.map((s, i) => [s, i]))
  tasks.sort((a, b) => {
    const oa = order.get(a.status as BoardStatus) ?? 99
    const ob = order.get(b.status as BoardStatus) ?? 99
    if (oa !== ob) return oa - ob
    return a.position - b.position
  })

  return tasks
    .filter((t) => BOARD_STATUSES.includes(t.status as BoardStatus))
    .map((t) => ({
      id: t.id,
      displayId: t.displayId,
      displayLabel: formatTaskDisplayId(t.displayId),
      title: t.title,
      description: t.description,
      status: (BOARD_STATUSES.includes(t.status as BoardStatus)
        ? t.status
        : "TODO") as BoardStatus,
      priority: t.priority,
      position: t.position,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      assigneeId: t.assigneeId,
      createdById: t.createdById,
      assignee: t.assignee
        ? {
            name: t.assignee.name,
            initials: initials(t.assignee.name, t.assignee.email),
          }
        : null,
      createdBy: t.createdBy
        ? {
            id: t.createdBy.id,
            label: t.createdBy.name?.trim() || t.createdBy.email,
            initials: initials(t.createdBy.name, t.createdBy.email),
          }
        : null,
      projectName: t.project?.name ?? null,
      projectTeam: (t.project?.team as TeamSlug | undefined) ?? null,
      assigneeTeam: (t.assignee?.team as TeamSlug | undefined) ?? null,
      createdByTeam: (t.createdBy?.team as TeamSlug | undefined) ?? null,
      commentCount: t._count.comments,
      attachmentCount: t._count.attachments,
    }))
}
