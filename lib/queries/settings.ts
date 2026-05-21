import { prisma } from "@/lib/prisma"

export async function getSettingsData() {
  const [automationRules, projects] = await Promise.all([
    prisma.automationRule.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.project.findMany({ orderBy: { name: "asc" } }),
  ])

  return { automationRules, projects }
}
