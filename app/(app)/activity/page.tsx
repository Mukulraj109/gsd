import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { format, isToday, isYesterday } from "date-fns"
import { authOptions } from "@/lib/auth"
import { getActivityFeed } from "@/lib/queries/activity"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock, Folder } from "lucide-react"
import { statusToBadgeVariant, priorityLabel } from "@/lib/constants/tasks"

function dayLabel(d: Date) {
  if (isToday(d)) return "TODAY"
  if (isYesterday(d)) return "YESTERDAY"
  return format(d, "MMM d, yyyy").toUpperCase()
}

function formatActivityDetail(action: string, details: string | null): string | null {
  if (!details) return null
  if (action === "STATUS_CHANGED") {
    try {
      const j = JSON.parse(details) as { from?: string; to?: string }
      return `${j.from ?? "?"} → ${j.to ?? "?"}`
    } catch {
      return details
    }
  }
  if (action === "ASSIGNED") {
    try {
      const j = JSON.parse(details) as { assignedTo?: string }
      return j.assignedTo ? `Assigned to ${j.assignedTo}` : details
    } catch {
      return details
    }
  }
  return details.length > 80 ? `${details.slice(0, 80)}…` : details
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const logs = await getActivityFeed(80)

  const grouped = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    const key = dayLabel(log.createdAt)
    if (!acc[key]) acc[key] = []
    acc[key].push(log)
    return acc
  }, {})

  const order = Object.entries(grouped)
    .sort(([, a], [, b]) => {
      const ta = Math.max(...a.map((l) => l.createdAt.getTime()))
      const tb = Math.max(...b.map((l) => l.createdAt.getTime()))
      return tb - ta
    })
    .map(([k]) => k)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Activity Timeline</h1>
        <p className="text-[var(--text-muted)]">Track all changes and updates across your workspace.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {order.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No activity yet.</p>
          ) : (
            order.map((dayKey) => (
              <div key={dayKey}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="text-sm font-bold tracking-wider text-[var(--text-muted)]">{dayKey}</h2>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                </div>
                <div className="relative space-y-6 pl-8 before:absolute before:left-[11px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--border)]">
                  {grouped[dayKey]!.map((log) => {
                    const actor = log.user?.name ?? log.user?.email ?? "System"
                    const initials = actor
                      .split(/\s+/)
                      .map((p) => p[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                    const detail = formatActivityDetail(log.action, log.details)
                    return (
                      <div key={log.id} className="relative">
                        <div className="absolute -left-8 top-1 z-10 h-6 w-6 rounded-full border-2 border-white bg-[var(--primary)] shadow-sm" />
                        <Card className="p-4">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-semibold text-[var(--heading)]">{actor}</span>
                                <span className="text-sm text-[var(--text-muted)]">
                                  {log.action.toLowerCase().replaceAll("_", " ")}
                                </span>
                                {detail && (
                                  <Badge variant="outline" className="text-xs">
                                    {detail}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-[var(--text)]">
                                <span className="font-medium">{log.task?.title ?? "Task"}</span>
                              </p>
                              {log.task ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  {log.task.project?.name ? (
                                    <span className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                      <Folder className="h-3 w-3" />
                                      {log.task.project.name}
                                    </span>
                                  ) : null}
                                  <Badge variant={statusToBadgeVariant(log.task.status)} className="text-[10px]">
                                    {log.task.status.replaceAll("_", " ")}
                                  </Badge>
                                  <Badge variant="outline" className="text-[10px]">
                                    {priorityLabel(log.task.priority)}
                                  </Badge>
                                </div>
                              ) : null}
                              {log.task?.description ? (
                                <p className="line-clamp-2 text-xs text-[var(--text-muted)]">{log.task.description}</p>
                              ) : null}
                              <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
                                <Clock className="h-3 w-3" />
                                {format(log.createdAt, "h:mm a")}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <Card className="p-6">
            <h3 className="mb-2 font-semibold text-[var(--heading)]">Summary</h3>
            <p className="text-sm text-[var(--text-muted)]">
              {logs.length} recent events loaded from the database.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
