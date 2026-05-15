import { prisma } from "@/lib/prisma"

export async function getSettingsData() {
  const [users, automationRules, projects] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
      },
    }),
    prisma.automationRule.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ])

  return { users, automationRules, projects }
}
