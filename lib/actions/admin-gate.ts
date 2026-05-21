"use server"

import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth/permissions"
import {
  setAdminGateCookie,
  clearAdminGateCookie,
  isAdminPinConfigured,
} from "@/lib/auth/admin-gate"

export async function verifyAdminPinAction(pin: string) {
  const user = await requireAdmin()
  const expected = process.env.ADMIN_GATE_PIN?.trim()
  if (!expected) {
    await setAdminGateCookie(user.id)
    redirect("/admin/team")
  }
  if (pin.trim() !== expected) {
    throw new Error("Incorrect admin PIN")
  }
  await setAdminGateCookie(user.id)
  redirect("/admin/team")
}

export async function enterAdminWithoutPinAction() {
  const user = await requireAdmin()
  if (isAdminPinConfigured()) {
    throw new Error("Admin PIN is required")
  }
  await setAdminGateCookie(user.id)
  redirect("/admin/team")
}

export async function logoutAdminGateAction() {
  await clearAdminGateCookie()
  redirect("/dashboard")
}
