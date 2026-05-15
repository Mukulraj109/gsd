import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    { label: "Total Tasks", value: "24", icon: CheckCircle2, color: "text-[var(--primary)]" },
    { label: "In Progress", value: "8", icon: Clock, color: "text-[var(--secondary)]" },
    { label: "Overdue", value: "3", icon: AlertCircle, color: "text-[var(--error)]" },
    { label: "Completed This Week", value: "12", icon: TrendingUp, color: "text-[var(--success)]" },
  ]

  const myTasks = [
    { id: 1, title: "Architecture Review for Project Zenith", status: "todo", priority: "medium", dueDate: "Oct 24" },
    { id: 2, title: "Final Branding Assets Approval", status: "review", priority: "high", dueDate: "Today" },
    { id: 3, title: "Update Q4 Design Specifications", status: "in-progress", priority: "low", dueDate: "Oct 28" },
  ]

  const recentActivity = [
    { user: "Marcus Miller", action: "completed", task: "API Integration", time: "2 hours ago" },
    { user: "Sarah Chen", action: "commented on", task: "Dashboard Analytics", time: "4 hours ago" },
    { user: "Elena Rodriguez", action: "assigned", task: "Mobile App Testing", time: "5 hours ago" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Dashboard</h1>
        <p className="text-[var(--text-muted)]">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[var(--text-muted)]">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--heading)]">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* My Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--text)]">{task.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.status as any}>{task.status.replace('-', ' ')}</Badge>
                      <Badge variant={task.priority === "high" ? "error" : task.priority === "medium" ? "warning" : "outline"}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{task.dueDate}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-[var(--text)]">
                      <span className="font-medium">{activity.user}</span>{' '}
                      {activity.action}{' '}
                      <span className="font-medium">{activity.task}</span>
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
