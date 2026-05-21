import { prisma } from "@/lib/prisma"
import { startOfDay, subDays } from "date-fns"
import type { TeamSlug } from "@/lib/constants/teams"
import {
  getSessionUser,
  taskWhereForUser,
  isAdmin,
  type BrowseContext,
} from "@/lib/auth/permissions"

export async function getDashboardData(userId: string, ctx: BrowseContext) {
  const user = await getSessionUser()
  if (!user) {
    return {
      totalTasks: 0,
      inProgress: 0,
      overdue: 0,
      completedThisWeek: 0,
      myTasks: [],
      recentActivity: [],
      isPersonal: true,
    }
  }

  const today = startOfDay(new Date())
  const weekAgo = subDays(today, 7)
  const personal = !isAdmin(user)

  const taskScope = personal
    ? { status: { not: "CLOSED" as const }, assigneeId: userId }
    : taskWhereForUser(user, ctx)

  const [
    totalTasks,
    inProgress,
    overdue,
    completedThisWeek,
    myTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.task.count({ where: taskScope }),
    prisma.task.count({ where: { ...taskScope, status: "IN_PROGRESS" } }),
    prisma.task.count({
      where: {
        ...taskScope,
        dueDate: { lt: today },
        status: { notIn: ["DONE", "CLOSED"] },
      },
    }),
    prisma.task.count({
      where: {
        ...taskScope,
        status: "DONE",
        updatedAt: { gte: weekAgo },
      },
    }),
    prisma.task.findMany({
      where: personal ? { ...taskScope, assigneeId: userId } : taskScope,
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        project: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
        assignee: { select: { name: true, email: true } },
        _count: { select: { comments: true, attachments: true } },
      },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true, email: true } },
        task: {
          select: {
            id: true,
            displayId: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            project: { select: { name: true } },
          },
        },
      },
    }),
  ])

  return {
    totalTasks,
    inProgress,
    overdue,
    completedThisWeek,
    myTasks,
    recentActivity,
    isPersonal: personal,
    activeTeam: ctx.team as TeamSlug | null,
    activeProjectName: ctx.activeProjectName,
  }
}
