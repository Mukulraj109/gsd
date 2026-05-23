import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/permissions"
import { hasValidAdminGate } from "@/lib/auth/admin-gate"
import { AdminShell } from "@/components/layout/admin-shell"

export default async function AdminShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  if (!(await hasValidAdminGate(user.id))) redirect("/admin/gate")

  return <AdminShell>{children}</AdminShell>
}
