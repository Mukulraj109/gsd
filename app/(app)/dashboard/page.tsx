import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { format, formatDistanceToNow } from "date-fns"
import { authOptions } from "@/lib/auth"
import { getDashboardData } from "@/lib/queries/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"
import { statusToBadgeVariant, priorityLabel } from "@/lib/constants/tasks"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const data = await getDashboardData(session.user.id)

  const stats = [
    { label: "Total Tasks", value: String(data.totalTasks), icon: CheckCircle2, color: "text-[var(--primary)]" },
    { label: "In Progress", value: String(data.inProgress), icon: Clock, color: "text-[var(--secondary)]" },
    { label: "Overdue", value: String(data.overdue), icon: AlertCircle, color: "text-[var(--error)]" },
    {
      label: "Completed This Week",
      value: String(data.completedThisWeek),
      icon: TrendingUp,
      color: "text-[var(--success)]",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Dashboard</h1>
        <p className="text-[var(--text-muted)]">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-muted)]">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--heading)]">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.myTasks.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No assigned tasks yet.</p>
              ) : (
                data.myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-[var(--text)]">{task.title}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={statusToBadgeVariant(task.status)}>
                          {task.status.replaceAll("_", " ")}
                        </Badge>
                        <Badge
                          variant={
                            task.priority === "HIGH"
                              ? "error"
                              : task.priority === "MEDIUM"
                                ? "warning"
                                : "outline"
                          }
                        >
                          {priorityLabel(task.priority)}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm text-[var(--text-muted)]">
                      {task.dueDate
                        ? format(new Date(task.dueDate), "MMM d")
                        : "—"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No activity yet.</p>
              ) : (
                data.recentActivity.map((log) => {
                  const label = log.user?.name ?? log.user?.email ?? "Someone"
                  const initials = label
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  return (
                    <div key={log.id} className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm text-[var(--text)]">
                          <span className="font-medium">{label}</span>{" "}
                          <span className="text-[var(--text-muted)]">{log.action.toLowerCase().replaceAll("_", " ")}</span>{" "}
                          <span className="font-medium">{log.task?.title ?? "task"}</span>
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
