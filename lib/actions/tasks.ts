"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import {
  BOARD_STATUSES,
  TASK_STATUSES,
  type BoardStatus,
  type TaskStatus,
} from "@/lib/constants/tasks"
import {
  requireSessionUser,
  taskAccessWhereForUser,
  canAssignToProject,
  canViewTeamBoard,
  isAdmin,
} from "@/lib/auth/permissions"
import { notifyTaskAssigned, notifyTaskUpdated } from "@/lib/email/notifications"
import { formatTaskDisplayId } from "@/lib/constants/teams"

async function requireUserId() {
  const user = await requireSessionUser()
  return user.id
}

async function getActor() {
  return requireSessionUser()
}

function actorLabel(user: { name: string | null; email: string }) {
  return user.name?.trim() || user.email || "Admin"
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

async function assertTaskAccess(taskId: string) {
  const user = await getActor()
  const task = await prisma.task.findFirst({
    where: { id: taskId, ...taskAccessWhereForUser(user) },
    include: {
      assignee: { select: { email: true, name: true } },
      createdBy: { select: { email: true, name: true } },
      project: { select: { team: true } },
    },
  })
  if (!task) throw new Error("Task not found or access denied")
  return { user, task }
}

function revalidateTaskPaths() {
  revalidatePath("/board")
  revalidatePath("/tasks")
  revalidatePath("/dashboard")
  revalidatePath("/admin/activity")
}

export type CreateTaskInput = {
  title: string
  status?: BoardStatus
  description?: string
  priority?: string
  dueDate?: string | null
  projectId?: string | null
  assignDefaultProject?: boolean
  assigneeId?: string | null
}

export async function createTaskAction(input: CreateTaskInput) {
  const user = await getActor()
  const status = input.status ?? "TODO"
  if (!BOARD_STATUSES.includes(status)) throw new Error("Invalid status")
  const trimmed = input.title.trim()
  if (!trimmed) throw new Error("Title is required")

  const rawPriority = (input.priority ?? "MEDIUM").toUpperCase()
  const priority = ["HIGH", "MEDIUM", "LOW"].includes(rawPriority) ? rawPriority : "MEDIUM"

  let projectId: string | null = input.projectId?.trim() || null
  if (projectId) {
    const p = await prisma.project.findUnique({ where: { id: projectId } })
    if (!p) projectId = null
    else if (!canAssignToProject(user, p.team)) {
      throw new Error("Cannot assign to a project outside your team")
    } else {
      projectId = p.id
    }
  }

  if (!projectId && input.assignDefaultProject !== false && user.team) {
    const fallback = await prisma.project.findFirst({
      where: { team: user.team },
      orderBy: { createdAt: "asc" },
    })
    projectId = fallback?.id ?? null
  }

  let assigneeId: string | null = input.assigneeId?.trim() || null
  if (assigneeId) {
    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } })
    if (!assignee) {
      assigneeId = user.id
    } else if (!isAdmin(user) && assigneeId !== user.id) {
      if (!canViewTeamBoard(user) || assignee.team !== user.team) {
        throw new Error("Cannot assign tasks to other members without team board access")
      }
      assigneeId = assignee.id
    } else {
      assigneeId = assignee.id
    }
  } else {
    assigneeId = user.id
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
      createdById: user.id,
      assigneeId,
      projectId,
    },
    include: {
      assignee: { select: { email: true, name: true } },
    },
  })

  await logActivity(user.id, task.id, "CREATED")
  if (assigneeId && assigneeId !== user.id && task.assignee) {
    await logActivity(user.id, task.id, "ASSIGNED", JSON.stringify({ assigneeId }))
    await notifyTaskAssigned({
      assigneeEmail: task.assignee.email,
      assigneeName: task.assignee.name,
      taskTitle: task.title,
      displayId: task.displayId,
      priority: task.priority,
      dueDate: task.dueDate,
      description: task.description,
      assignedBy: actorLabel(user),
    })
  }

  revalidateTaskPaths()

  return task
}

export async function updateTaskStatusAction(taskId: string, newStatus: BoardStatus) {
  const user = await getActor()
  if (!BOARD_STATUSES.includes(newStatus)) throw new Error("Invalid status")

  const { task } = await assertTaskAccess(taskId)
  const oldStatus = task.status
  if (oldStatus === newStatus) return

  const maxPos = await prisma.task.aggregate({
    where: { status: newStatus },
    _max: { position: true },
  })
  const position = (maxPos._max.position ?? -1) + 1

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: newStatus, position },
    include: { assignee: { select: { email: true, name: true } } },
  })

  await logActivity(
    user.id,
    taskId,
    "STATUS_CHANGED",
    JSON.stringify({ from: oldStatus, to: newStatus })
  )

  if (updated.assignee) {
    await notifyTaskUpdated({
      recipientEmail: updated.assignee.email,
      recipientName: updated.assignee.name,
      taskTitle: updated.title,
      updatedColumns: `Status (${oldStatus.replaceAll("_", " ")} → ${newStatus.replaceAll("_", " ")})`,
      updatedBy: actorLabel(user),
    })
  }

  revalidateTaskPaths()
}

export async function closeTaskAction(taskId: string) {
  const user = await getActor()
  const { task } = await assertTaskAccess(taskId)
  if (task.status !== "DONE") throw new Error("Only tasks in Done can be closed")

  await prisma.task.update({
    where: { id: taskId },
    data: { status: "CLOSED", closedAt: new Date() },
  })
  await logActivity(user.id, taskId, "CLOSED")
  revalidateTaskPaths()
}

export type UpdateTaskInput = {
  taskId: string
  title?: string
  description?: string | null
  priority?: string
  dueDate?: string | null
  projectId?: string | null
  assigneeId?: string | null
  status?: BoardStatus
}

export async function updateTaskAction(input: UpdateTaskInput) {
  const user = await getActor()
  const { task } = await assertTaskAccess(input.taskId)
  const changes: string[] = []

  const data: Record<string, unknown> = {}

  if (input.title !== undefined) {
    const t = input.title.trim()
    if (!t) throw new Error("Title is required")
    if (t !== task.title) {
      data.title = t
      changes.push("title")
    }
  }
  if (input.description !== undefined && input.description !== task.description) {
    data.description = input.description?.trim() || null
    changes.push("description")
  }
  if (input.priority !== undefined) {
    const p = input.priority.toUpperCase()
    if (p !== task.priority) {
      data.priority = p
      changes.push("priority")
    }
  }
  if (input.dueDate !== undefined) {
    let due: Date | null = null
    if (input.dueDate?.trim()) {
      const parsed = new Date(input.dueDate.trim())
      if (!Number.isNaN(parsed.getTime())) due = parsed
    }
    const prev = task.dueDate?.toISOString() ?? null
    const next = due?.toISOString() ?? null
    if (prev !== next) {
      data.dueDate = due
      changes.push("due date")
    }
  }
  if (input.assigneeId !== undefined && input.assigneeId !== task.assigneeId) {
    if (input.assigneeId) {
      const a = await prisma.user.findUnique({ where: { id: input.assigneeId } })
      if (!a) throw new Error("Assignee not found")
      if (
        !isAdmin(user) &&
        input.assigneeId !== user.id &&
        (!canViewTeamBoard(user) || a.team !== user.team)
      ) {
        throw new Error("Cannot assign tasks to other members without team board access")
      }
    }
    data.assigneeId = input.assigneeId || null
    changes.push("assignee")
  }
  if (input.projectId !== undefined && input.projectId !== task.projectId) {
    if (input.projectId) {
      const p = await prisma.project.findUnique({ where: { id: input.projectId } })
      if (!p) throw new Error("Project not found")
      if (!canAssignToProject(user, p.team)) {
        throw new Error("Cannot assign to a project outside your team")
      }
    }
    data.projectId = input.projectId || null
    changes.push("project")
  }
  if (input.status !== undefined && input.status !== task.status) {
    if (!BOARD_STATUSES.includes(input.status)) throw new Error("Invalid status")
    data.status = input.status
    changes.push("status")
  }

  if (!Object.keys(data).length) return

  const updated = await prisma.task.update({
    where: { id: input.taskId },
    data,
    include: {
      assignee: { select: { email: true, name: true } },
      createdBy: { select: { email: true, name: true } },
    },
  })

  await logActivity(
    user.id,
    input.taskId,
    "UPDATED",
    JSON.stringify({ fields: changes })
  )

  if (changes.includes("assignee") && updated.assignee) {
    await notifyTaskAssigned({
      assigneeEmail: updated.assignee.email,
      assigneeName: updated.assignee.name,
      taskTitle: updated.title,
      displayId: updated.displayId,
      priority: updated.priority,
      dueDate: updated.dueDate,
      description: updated.description,
      assignedBy: actorLabel(user),
    })
  } else if (updated.assignee && changes.length > 0) {
    await notifyTaskUpdated({
      recipientEmail: updated.assignee.email,
      recipientName: updated.assignee.name,
      taskTitle: updated.title,
      updatedColumns: changes.join(", "),
      updatedBy: actorLabel(user),
    })
  }

  revalidateTaskPaths()
}

export async function deleteTaskAction(taskId: string) {
  const user = await getActor()
  await assertTaskAccess(taskId)
  await prisma.task.delete({ where: { id: taskId } })
  revalidateTaskPaths()
}

export async function addCommentAction(taskId: string, content: string) {
  const user = await getActor()
  await assertTaskAccess(taskId)
  const trimmed = content.trim()
  if (!trimmed) throw new Error("Comment cannot be empty")

  await prisma.comment.create({
    data: { taskId, userId: user.id, content: trimmed },
  })
  await logActivity(user.id, taskId, "COMMENTED")
  revalidateTaskPaths()
}

export type BoardPositionUpdate = { id: string; status: BoardStatus; position: number }

export async function persistBoardOrderAction(updates: BoardPositionUpdate[]) {
  const user = await getActor()
  if (!updates.length) return

  await prisma.$transaction(async (tx) => {
    for (const u of updates) {
      const prev = await tx.task.findFirst({
        where: { id: u.id, ...taskAccessWhereForUser(user) },
      })
      if (!prev) continue
      await tx.task.update({
        where: { id: u.id },
        data: { status: u.status, position: u.position },
      })
      if (prev.status !== u.status) {
        await tx.activityLog.create({
          data: {
            userId: user.id,
            taskId: u.id,
            action: "STATUS_CHANGED",
            details: JSON.stringify({ from: prev.status, to: u.status }),
          },
        })
        const t = await tx.task.findUnique({
          where: { id: u.id },
          include: { assignee: { select: { email: true, name: true } } },
        })
        if (t?.assignee) {
          await notifyTaskUpdated({
            recipientEmail: t.assignee.email,
            recipientName: t.assignee.name,
            taskTitle: t.title,
            updatedColumns: `Status (${prev.status.replaceAll("_", " ")} → ${u.status.replaceAll("_", " ")})`,
            updatedBy: actorLabel(user),
          })
        }
      }
    }
  })

  revalidateTaskPaths()
}

export async function getTaskDetailAction(taskId: string) {
  const user = await getActor()
  const task = await prisma.task.findFirst({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, team: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true, email: true } } },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, name: true, email: true } } },
      },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { user: { select: { name: true, email: true } } },
      },
    },
  })
  if (!task) return null
  if (task.status === "CLOSED") return null

  const scope = taskAccessWhereForUser(user)
  const allowed = await prisma.task.findFirst({
    where: { id: taskId, ...scope },
  })
  if (!allowed) return null

  return {
    ...task,
    displayLabel: formatTaskDisplayId(task.displayId),
    dueDate: task.dueDate?.toISOString() ?? null,
  }
}