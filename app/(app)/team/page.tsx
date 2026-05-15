import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, UserPlus, MoreVertical, TrendingUp } from "lucide-react"

export default function TeamPage() {
  const teamMembers = [
    { name: "Sarah Chen", role: "Lead Designer", email: "sarah.chen@gmail.com", badge: "ADMIN", tasks: 12, status: "ACTIVE" },
    { name: "Marcus Miller", role: "Sr. Developer", email: "m.miller@gmail.com", badge: "MEMBER", tasks: 88, status: "ACTIVE" },
    { name: "Elena Rodriguez", role: "Product Manager", email: "elena.rod@gmail.com", badge: "ADMIN", tasks: 65, status: "ACTIVE" },
    { name: "David Park", role: "Marketing Lead", email: "dpark.gsd@gmail.com", badge: "MEMBER", tasks: 15, status: "ACTIVE" },
    { name: "Chloe Sims", role: "Content Strategist", email: "chloe.sims@gmail.com", badge: "MEMBER", tasks: 82, status: "ACTIVE" },
  ]

  const topContributors = [
    { name: "David Park", initials: "DP", tasks: 15 },
    { name: "Sarah Chen", initials: "SC", tasks: 12 },
    { name: "Marcus Miller", initials: "MM", tasks: 8 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Team Directory</h1>
        <p className="text-[var(--text-muted)]">Manage your workspace members and their active workloads.</p>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search team..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Filter
          </Button>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Invite Member
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">NAME</th>
                      <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">EMAIL ADDRESS</th>
                      <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">ROLE</th>
                      <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">STATUS</th>
                      <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">ACTIVE TASKS</th>
                      <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member, index) => (
                      <tr key={index} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-[var(--text)]">{member.name}</p>
                              <p className="text-sm text-[var(--text-muted)]">{member.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-[var(--text)]">{member.email}</td>
                        <td className="py-4">
                          <Badge variant={member.badge === "ADMIN" ? "default" : "secondary"}>
                            {member.badge}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant="success">{member.status}</Badge>
                        </td>
                        <td className="py-4">
                          <span className="font-semibold text-[var(--primary)]">{member.tasks}</span>
                        </td>
                        <td className="py-4">
                          <button className="text-[var(--text-muted)] hover:text-[var(--text)]">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="mt-4 flex items-center justify-between text-sm text-[var(--text-muted)]">
                <p>Showing 5 of 24 team members</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">3</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Load Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--primary)]" />
                Load Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--text-muted)]">Average tasks per member is currently</p>
                  <p className="text-4xl font-bold text-[var(--heading)] mt-2">7.4</p>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 w-3/4 rounded-full bg-[var(--primary)]"></div>
                </div>
                <p className="text-sm text-[var(--text-muted)]">
                  Resources are optimally distributed across teams.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{contributor.initials}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-[var(--text)]">{contributor.name}</span>
                    </div>
                    <Badge variant="default">{contributor.tasks} Tasks</Badge>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--text-muted)]">Updated 2 minutes ago</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
