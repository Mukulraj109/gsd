"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function setAutomationRuleEnabledAction(id: string, enabled: boolean) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role !== "ADMIN") throw new Error("Forbidden")

  await prisma.automationRule.update({
    where: { id },
    data: { enabled },
  })
  revalidatePath("/admin/settings")
}
