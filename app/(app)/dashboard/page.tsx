import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { format, formatDistanceToNow, isBefore, startOfDay } from "date-fns"
import { authOptions } from "@/lib/auth"
import { getDashboardData } from "@/lib/queries/dashboard"
import { TEAM_LABELS } from "@/lib/constants/teams"
import { getSessionUser, resolveBrowseContext } from "@/lib/auth/permissions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CheckCircle2, Clock, AlertCircle, TrendingUp, MessageSquare, Paperclip, Folder, User } from "lucide-react"
import { statusToBadgeVariant, priorityLabel } from "@/lib/constants/tasks"

function personLabel(name: string | null | undefined, email: string) {
  return name?.trim() || email
}

type Props = {
  searchParams: Promise<{ team?: string; scope?: string; project?: string }>
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const user = await getSessionUser()
  if (!user) redirect("/login")

  const params = await searchParams
  const ctx = await resolveBrowseContext(user, params)
  const data = await getDashboardData(session.user.id, ctx)
  const todayStart = startOfDay(new Date())

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
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-base text-[var(--text-muted)]">
          {data.isPersonal ? (
            <>
              Metrics for{" "}
              <span className="font-semibold text-[var(--heading)]">
                your assigned tasks
                {ctx.activeProjectName ? ` · ${ctx.activeProjectName}` : ""}
              </span>
              .
            </>
          ) : (
            <>
              Metrics for{" "}
              <span className="font-semibold text-[var(--heading)]">
                {ctx.activeProjectName
                  ? ctx.activeProjectName
                  : data.activeTeam
                    ? TEAM_LABELS[data.activeTeam]
                    : "all teams"}
              </span>
              {ctx.activeProjectName
                ? ` (${TEAM_LABELS[ctx.team!]})`
                : data.activeTeam
                  ? " — pick a project in the sidebar to narrow further."
                  : " — select a team in the sidebar to filter."}
            </>
          )}
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--heading)] lg:text-5xl">Dashboard</h1>
        <p className="max-w-3xl text-lg text-[var(--text-muted)]">
          Welcome back{session.user.name ? `, ${session.user.name}` : ""}! Here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="flex min-h-[7.5rem] flex-col justify-between gap-4 p-6 lg:min-h-[8.5rem] lg:p-7">
              <div className="flex items-start justify-between gap-3">
                <p className="text-base font-medium text-[var(--text-muted)]">{stat.label}</p>
                <stat.icon className={`h-7 w-7 shrink-0 ${stat.color}`} />
              </div>
              <p className="text-4xl font-bold tabular-nums text-[var(--heading)] lg:text-5xl">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 lg:px-8 lg:pt-8">
            <CardTitle className="text-2xl lg:text-3xl">My Tasks</CardTitle>
            <Link href="/board" className="text-base font-medium text-[var(--primary)] hover:underline">
              Open board
            </Link>
          </CardHeader>
          <CardContent className="lg:px-8 lg:pb-8">
            <div className="space-y-5">
              {data.myTasks.length === 0 ? (
                <p className="text-base text-[var(--text-muted)]">No assigned tasks yet.</p>
              ) : (
                data.myTasks.map((task) => {
                  const due = task.dueDate ? new Date(task.dueDate) : null
                  const overdueVisible =
                    !!due && isBefore(due, todayStart) && task.status !== "DONE"
                  const creator = task.createdBy
                  const assigneeName = task.assignee
                    ? personLabel(task.assignee.name, task.assignee.email)
                    : null
                  return (
                    <div
                      key={task.id}
                      className="space-y-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm lg:p-6"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1 space-y-2">
                          <p className="text-lg font-semibold text-[var(--heading)]">{task.title}</p>
                          {task.description ? (
                            <p className="line-clamp-3 text-base leading-relaxed text-[var(--text-muted)]">
                              {task.description}
                            </p>
                          ) : null}
                        </div>
                        <div className="shrink-0 sm:text-right">
                          {due ? (
                            <span
                              className={`text-base font-medium ${
                                overdueVisible ? "text-[var(--error)]" : "text-[var(--text-muted)]"
                              }`}
                            >
                              {overdueVisible ? "Overdue · " : ""}
                              {format(due, "MMM d, yyyy")}
                            </span>
                          ) : (
                            <span className="text-base text-[var(--text-muted)]">No due date</span>
                          )}
                        </div>
                      </div>

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

                      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--border)] pt-4 text-sm text-[var(--text-muted)]">
                        {task.project?.name ? (
                          <span className="flex items-center gap-1.5">
                            <Folder className="h-4 w-4 shrink-0" />
                            <span className="truncate">{task.project.name}</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                            <Folder className="h-4 w-4" />
                            No project
                          </span>
                        )}
                        {creator ? (
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4 shrink-0" />
                            <span>
                              Created by{" "}
                              <span className="font-medium text-[var(--text)]">
                                {personLabel(creator.name, creator.email)}
                              </span>
                            </span>
                          </span>
                        ) : null}
                        {assigneeName ? (
                          <span className="flex items-center gap-1.5">
                            <span className="font-medium text-[var(--text)]">Assignee:</span> {assigneeName}
                          </span>
                        ) : null}
                        <span className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {task._count.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-4 w-4" />
                            {task._count.attachments}
                          </span>
                        </span>
                        <span className="text-[var(--text-muted)]">
                          Updated {formatDistanceToNow(task.updatedAt, { addSuffix: true })}
                        </span>
                      </div>

                      <Link
                        href="/board"
                        className="inline-block text-sm font-medium text-[var(--primary)] hover:underline"
                      >
                        View on task board →
                      </Link>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="lg:px-8 lg:pt-8">
            <CardTitle className="text-2xl lg:text-3xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="lg:px-8 lg:pb-8">
            <div className="space-y-5">
              {data.recentActivity.length === 0 ? (
                <p className="text-base text-[var(--text-muted)]">No activity yet.</p>
              ) : (
                data.recentActivity.map((log) => {
                  const label = log.user?.name ?? log.user?.email ?? "Someone"
                  const initials = label
                    .split(/\s+/)
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  const t = log.task
                  return (
                    <div key={log.id} className="flex items-start gap-4 border-b border-[var(--border)] pb-5 last:border-0 last:pb-0">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="text-sm">{initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="text-base leading-relaxed text-[var(--text-body)]">
                          <span className="font-medium">{label}</span>{" "}
                          <span className="text-[var(--text-muted)]">{log.action.toLowerCase().replaceAll("_", " ")}</span>{" "}
                          <span className="font-medium">{t?.title ?? "task"}</span>
                        </p>
                        {t ? (
                          <div className="flex flex-wrap items-center gap-2 text-sm">
                            {t.project?.name ? (
                              <span className="flex items-center gap-1.5 text-[var(--text-muted)]">
                                <Folder className="h-4 w-4" />
                                {t.project.name}
                              </span>
                            ) : null}
                            <Badge variant={statusToBadgeVariant(t.status)} className="text-xs">
                              {t.status.replaceAll("_", " ")}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {priorityLabel(t.priority)}
                            </Badge>
                          </div>
                        ) : null}
                        {t?.description ? (
                          <p className="line-clamp-2 text-sm text-[var(--text-muted)]">{t.description}</p>
                        ) : null}
                        <p className="text-sm text-[var(--text-muted)]">
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
