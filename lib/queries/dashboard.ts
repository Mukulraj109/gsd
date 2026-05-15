import { prisma } from "@/lib/prisma"
import { startOfDay, subDays } from "date-fns"

export async function getDashboardData(userId: string) {
  const today = startOfDay(new Date())
  const weekAgo = subDays(today, 7)

  const [
    totalTasks,
    inProgress,
    overdue,
    completedThisWeek,
    myTasks,
    recentActivity,
  ] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "IN_PROGRESS" } }),
    prisma.task.count({
      where: {
        dueDate: { lt: today },
        status: { not: "DONE" },
      },
    }),
    prisma.task.count({
      where: {
        status: "DONE",
        updatedAt: { gte: weekAgo },
      },
    }),
    prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: { project: { select: { name: true } } },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: { select: { name: true, email: true } },
        task: { select: { title: true } },
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
  }
}
