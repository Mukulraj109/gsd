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

export async function createTaskAction(title: string, initialStatus: TaskStatus = "TODO") {
  const userId = await requireUserId()
  if (!TASK_STATUSES.includes(initialStatus)) throw new Error("Invalid status")
  const trimmed = title.trim()
  if (!trimmed) throw new Error("Title is required")

  const project = await prisma.project.findFirst({ orderBy: { createdAt: "asc" } })

  const maxPos = await prisma.task.aggregate({
    where: { status: initialStatus },
    _max: { position: true },
  })
  const position = (maxPos._max.position ?? -1) + 1

  const task = await prisma.task.create({
    data: {
      title: trimmed,
      status: initialStatus,
      priority: "MEDIUM",
      position,
      createdById: userId,
      assigneeId: userId,
      projectId: project?.id,
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
