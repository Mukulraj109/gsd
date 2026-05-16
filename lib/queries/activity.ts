import { prisma } from "@/lib/prisma"

export async function getActivityFeed(take = 60) {
  return prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      user: { select: { name: true, email: true } },
      task: {
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
          project: { select: { name: true } },
        },
      },
    },
  })
}
