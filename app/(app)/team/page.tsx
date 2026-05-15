import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getTeamMembers } from "@/lib/queries/team"
import { TeamDirectoryClient } from "@/components/team/team-directory-client"

export default async function TeamPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const teamMembers = await getTeamMembers()
  const members = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    role: m.role,
    verified: !!m.emailVerified,
    activeTasks: m._count.assignedTasks,
  }))

  return <TeamDirectoryClient members={members} isAdmin={session.user.role === "ADMIN"} />
}
