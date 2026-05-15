import { prisma } from "@/lib/prisma"

export async function getTeamMembers() {
  return prisma.user.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { assignedTasks: { where: { status: { not: "DONE" } } } },
      },
    },
  })
}
