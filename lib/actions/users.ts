"use server"

import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth/permissions"
import type { TeamSlug } from "@/lib/constants/teams"
import { TEAMS } from "@/lib/constants/teams"

export type CreateUserResult = {
  id: string
  email: string
  password: string
  displayLabel: string
}

export async function createUserAction(input: {
  email: string
  password: string
  name?: string
  team: TeamSlug | null
  devTeamAccess?: boolean
  role?: "ADMIN" | "MEMBER"
}): Promise<CreateUserResult> {
  const admin = await requireAdmin()
  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes("@")) throw new Error("Valid email is required")
  const password = input.password.trim()
  if (password.length < 8) throw new Error("Password must be at least 8 characters")
  const role = input.role === "ADMIN" ? "ADMIN" : "MEMBER"
  const team = role === "ADMIN" ? null : input.team
  if (role === "MEMBER" && (!team || !TEAMS.includes(team))) {
    throw new Error("Team is required for members")
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) throw new Error("A user with this email already exists")

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      password: hashed,
      role,
      team,
      devTeamAccess: role === "ADMIN" ? true : Boolean(input.devTeamAccess),
    },
  })

  revalidatePath("/admin/team")
  return {
    id: user.id,
    email: user.email,
    password,
    displayLabel: user.id.slice(0, 8).toUpperCase(),
  }
}

export async function updateUserAction(input: {
  userId: string
  email: string
  name?: string
  team: TeamSlug | null
  devTeamAccess?: boolean
  role?: "ADMIN" | "MEMBER"
  password?: string
}) {
  const admin = await requireAdmin()
  const newRole = input.role === "ADMIN" ? "ADMIN" : "MEMBER"
  const team = newRole === "ADMIN" ? null : input.team
  if (newRole === "MEMBER" && (!team || !TEAMS.includes(team))) {
    throw new Error("Team is required for members")
  }

  const target = await prisma.user.findUnique({ where: { id: input.userId } })
  if (!target) throw new Error("User not found")

  const email = input.email.trim().toLowerCase()
  if (!email || !email.includes("@")) throw new Error("Valid email is required")

  if (target.id === admin.id && target.role === "ADMIN" && newRole !== "ADMIN") {
    throw new Error("You cannot remove your own admin role")
  }

  const duplicate = await prisma.user.findFirst({
    where: { email, NOT: { id: input.userId } },
  })
  if (duplicate) throw new Error("Another user already uses this email")

  const password = input.password?.trim()
  if (password && password.length < 8) {
    throw new Error("Password must be at least 8 characters")
  }

  const data: {
    email: string
    name: string | null
    team: TeamSlug | null
    devTeamAccess: boolean
    role: string
    password?: string
  } = {
    email,
    name: input.name?.trim() || null,
    team,
    devTeamAccess: newRole === "ADMIN" ? true : Boolean(input.devTeamAccess),
    role: newRole,
  }

  if (password) {
    data.password = await bcrypt.hash(password, 10)
  }

  await prisma.user.update({
    where: { id: input.userId },
    data,
  })

  revalidatePath("/admin/team")
  revalidatePath("/board")
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin()
  if (userId === admin.id) throw new Error("You cannot delete your own account")

  const target = await prisma.user.findUnique({ where: { id: userId } })
  if (!target) throw new Error("User not found")

  await prisma.$transaction(async (tx) => {
    await tx.task.updateMany({
      where: { assigneeId: userId },
      data: { assigneeId: admin.id },
    })
    await tx.task.updateMany({
      where: { createdById: userId },
      data: { createdById: admin.id },
    })
    await tx.user.delete({ where: { id: userId } })
  })

  revalidatePath("/admin/team")
  revalidatePath("/board")
}
