"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { TASK_STATUSES, type TaskStatus } from "@/lib/constants/tasks"

async function requireUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

async function logActivity(
  userId: string,
  taskId: string,
  action: string,
  details?: string | null
) {
  await prisma.activityLog.create({
    data: { userId, taskId, action, details: details ?? undefined },
  })
}

export type CreateTaskInput = {
  title: string
  status?: TaskStatus
  description?: string
  priority?: string
  dueDate?: string | null
  projectId?: string | null
  /**
   * When true (default), missing/empty `projectId` uses the oldest project (quick add).
   * When false, tasks can be created with no project.
   */
  assignDefaultProject?: boolean
  assigneeId?: string | null
}

export async function createTaskAction(input: CreateTaskInput) {
  const userId = await requireUserId()
  const status = input.status ?? "TODO"
  if (!TASK_STATUSES.includes(status)) throw new Error("Invalid status")
  const trimmed = input.title.trim()
  if (!trimmed) throw new Error("Title is required")

  const rawPriority = (input.priority ?? "MEDIUM").toUpperCase()
  const priority = ["HIGH", "MEDIUM", "LOW"].includes(rawPriority) ? rawPriority : "MEDIUM"

  const assignDefaultProject = input.assignDefaultProject !== false
  let projectId: string | null = input.projectId?.trim() || null
  if (projectId) {
    const exists = await prisma.project.findUnique({ where: { id: projectId } })
    projectId = exists ? exists.id : null
  }
  if (!projectId && assignDefaultProject) {
    const fallback = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })
    projectId = fallback?.id ?? null
  }

  let assigneeId: string | null = input.assigneeId?.trim() || null
  if (assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
    assigneeId = assignee ? assignee.id : userId
  } else {
    assigneeId = userId
  }

  let dueDate: Date | undefined
  if (input.dueDate?.trim()) {
    const parsed = new Date(input.dueDate.trim())
    if (!Number.isNaN(parsed.getTime())) dueDate = parsed
  }

  const maxPos = await prisma.task.aggregate({
    where: { status },
    _max: { position: true },
  })
  const position = (maxPos._max.position ?? -1) + 1

  const task = await prisma.task.create({
    data: {
      title: trimmed,
      description: input.description?.trim() || null,
      status,
      priority,
      position,
      dueDate: dueDate ?? null,
      createdById: userId,
      assigneeId,
      projectId,
    },
  })

  await logActivity(userId, task.id, "CREATED")
  revalidatePath("/board")
  revalidatePath("/dashboard")
  revalidatePath("/activity")
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus) {
  const userId = await requireUserId()
  if (!TASK_STATUSES.includes(newStatus)) throw new Error("Invalid status")

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) throw new Error("Task not found")

  const oldStatus = task.status
  if (oldStatus === newStatus) return

  const maxPos = await prisma.task.aggregate({
    where: { status: newStatus },
    _max: { position: true },
  })
  const position = (maxPos._max.position ?? -1) + 1

  await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus, position },
  })

  await logActivity(
    userId,
    taskId,
    "STATUS_CHANGED",
    JSON.stringify({ from: oldStatus, to: newStatus })
  )
  revalidatePath("/board")
  revalidatePath("/dashboard")
  revalidatePath("/activity")
}

export type BoardPositionUpdate = { id: string; status: TaskStatus; position: number }

export async function persistBoardOrderAction(updates: BoardPositionUpdate[]) {
  const userId = await requireUserId()
  if (!updates.length) return

  await prisma.$transaction(async (tx) => {
    for (const u of updates) {
      const prev = await tx.task.findUnique({ where: { id: u.id } })
      if (!prev) continue
      await tx.task.update({
        where: { id: u.id },
        data: { status: u.status, position: u.position },
      })
      if (prev.status !== u.status) {
        await tx.activityLog.create({
          data: {
            userId,
            taskId: u.id,
            action: "STATUS_CHANGED",
            details: JSON.stringify({ from: prev.status, to: u.status }),
          },
        })
      }
    }
  })

  revalidatePath("/board")
  revalidatePath("/dashboard")
  revalidatePath("/activity")
}
