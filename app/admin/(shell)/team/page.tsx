import { getTeamMembers } from "@/lib/queries/team"
import { TeamDirectoryAdmin } from "@/components/admin/team-directory-admin"
import { TEAM_LABELS } from "@/lib/constants/teams"
import type { TeamSlug } from "@/lib/constants/teams"

export default async function AdminTeamPage() {
  const teamMembers = await getTeamMembers()
  const members = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    team: m.team as TeamSlug | null,
    devTeamAccess: m.devTeamAccess,
    activeTasks: m._count.assignedTasks,
    displayId: m.id.slice(0, 8).toUpperCase(),
  }))

  return <TeamDirectoryAdmin members={members} teamLabels={TEAM_LABELS} />
}
