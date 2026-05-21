import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/permissions"

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  if (!user || user.role !== "ADMIN") redirect("/dashboard")
  return <>{children}</>
}
