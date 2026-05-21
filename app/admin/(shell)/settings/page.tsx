import { getSettingsData } from "@/lib/queries/settings"
import { SettingsAdmin } from "@/components/admin/settings-admin"
import type { TeamSlug } from "@/lib/constants/teams"

export default async function AdminSettingsPage() {
  const data = await getSettingsData()
  return (
    <SettingsAdmin
      automationRules={data.automationRules}
      projects={data.projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        team: p.team as TeamSlug,
      }))}
    />
  )
}
