import { prisma } from "@/lib/prisma"
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/tasks"

export type BoardTaskRow = {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: string
  position: number
  dueDate: string | null
  assignee: { name: string | null; initials: string } | null
  createdBy: { label: string; initials: string } | null
  projectName: string | null
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

export async function getBoardTasks(): Promise<BoardTaskRow[]> {
  const tasks = await prisma.task.findMany({
    orderBy: [{ status: "asc" }, { position: "asc" }],
    include: {
      assignee: { select: { name: true, email: true } },
      createdBy: { select: { name: true, email: true } },
      project: { select: { name: true } },
      _count: { select: { comments: true, attachments: true } },
    },
  })

  const order = new Map(TASK_STATUSES.map((s, i) => [s, i]))
  tasks.sort((a, b) => {
    const oa = order.get(a.status as TaskStatus) ?? 99
    const ob = order.get(b.status as TaskStatus) ?? 99
    if (oa !== ob) return oa - ob
    return a.position - b.position
  })

  return tasks.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    status: (TASK_STATUSES.includes(t.status as TaskStatus)
      ? t.status
      : "TODO") as TaskStatus,
    priority: t.priority,
    position: t.position,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    assignee: t.assignee
      ? {
          name: t.assignee.name,
          initials: initials(t.assignee.name, t.assignee.email),
        }
      : null,
    createdBy: t.createdBy
      ? {
          label: t.createdBy.name?.trim() || t.createdBy.email,
          initials: initials(t.createdBy.name, t.createdBy.email),
        }
      : null,
    projectName: t.project?.name ?? null,
    commentCount: t._count.comments,
    attachmentCount: t._count.attachments,
  }))
}
