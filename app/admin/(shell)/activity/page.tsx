import { format, isToday, isYesterday } from "date-fns"
import { getActivityFeed } from "@/lib/queries/activity"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

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

export default async function AdminActivityPage() {
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
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--heading)] lg:text-5xl">Activity Timeline</h1>
        <p className="text-lg text-[var(--text-muted)]">All workspace activity (admin only).</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {order.length === 0 ? (
            <p className="text-base text-[var(--text-muted)]">No activity yet.</p>
          ) : (
            order.map((dayKey) => (
              <div key={dayKey}>
                <div className="mb-5 flex items-center gap-4">
                  <h2 className="text-base font-bold tracking-wider text-[var(--text-muted)]">{dayKey}</h2>
                  <div className="h-px flex-1 bg-[var(--border)]" />
                </div>
                <div className="relative space-y-6 pl-10 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--border)]">
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
                        <div className="absolute -left-10 top-2 z-10 h-8 w-8 rounded-full border-2 border-white bg-[var(--primary)] shadow-sm" />
                        <Card className="p-5 lg:p-6">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-11 w-11">
                              <AvatarFallback className="text-base">{initials}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-base font-semibold text-[var(--heading)]">{actor}</span>
                                <span className="text-base text-[var(--text-muted)]">
                                  {log.action.toLowerCase().replaceAll("_", " ")}
                                </span>
                                {detail && (
                                  <Badge variant="outline" className="text-sm">
                                    {detail}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-base text-[var(--text)]">
                                <span className="font-medium">{log.task?.title ?? "Task"}</span>
                              </p>
                              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                                <Clock className="h-4 w-4" />
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
          <Card className="p-6 lg:p-8">
            <h3 className="mb-3 text-xl font-semibold text-[var(--heading)]">Summary</h3>
            <p className="text-base text-[var(--text-muted)]">{logs.length} recent events.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
