import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getSettingsData } from "@/lib/queries/settings"
import { SettingsPageClient } from "@/components/settings/settings-page-client"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const data = await getSettingsData()
  return (
    <SettingsPageClient
      users={data.users}
      automationRules={data.automationRules}
      projects={data.projects}
      isAdmin={session.user.role === "ADMIN"}
    />
  )
}
