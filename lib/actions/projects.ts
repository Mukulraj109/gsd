"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth/permissions"
import type { TeamSlug } from "@/lib/constants/teams"
import { TEAMS } from "@/lib/constants/teams"

export async function createProjectAction(input: {
  name: string
  team: TeamSlug
  description?: string
  color?: string
}) {
  await requireAdmin()
  const name = input.name.trim()
  if (!name) throw new Error("Project name is required")
  if (!TEAMS.includes(input.team)) throw new Error("Invalid team")

  await prisma.project.create({
    data: {
      name,
      team: input.team,
      description: input.description?.trim() || null,
      color: input.color?.trim() || null,
    },
  })

  revalidatePath("/admin/settings")
  revalidatePath("/board")
  revalidatePath("/dashboard")
}

export async function deleteProjectAction(projectId: string) {
  await requireAdmin()
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { _count: { select: { tasks: true } } },
  })
  if (!project) throw new Error("Project not found")

  if (project._count.tasks > 0) {
    throw new Error("Delete or reassign all tasks in this project first")
  }

  await prisma.project.delete({ where: { id: projectId } })
  revalidatePath("/admin/settings")
}
