import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"

export default function ActivityPage() {
  const activities = [
    {
      user: "Alex Rivera",
      action: "changed status to",
      detail: "IN PROGRESS",
      task: "GSD-442: Design System Audit",
      time: "10:42 AM",
      date: "TODAY",
    },
    {
      user: "Alex Rivera",
      action: "set priority to",
      detail: "High",
      task: "GSD-442: Design System Audit",
      time: "2:15 PM",
      date: "YESTERDAY",
    },
    {
      user: "Jane Doe",
      action: "commented",
      comment: "I've started auditing the buttons. Most of the primary actions are using hardcoded blue. Will move them to the primary token by EOD.",
      task: "GSD-442: Design System Audit",
      time: "11:15 AM",
      date: "YESTERDAY",
    },
    {
      user: "System",
      action: "assigned",
      detail: "Jane Doe",
      task: "GSD-442: Design System Audit",
      time: "9:00 AM",
      date: "YESTERDAY",
      automated: true,
    },
    {
      user: "Marcus Chen",
      action: "uploaded",
      detail: "spec-requirements.pdf",
      task: "GSD-442: Design System Audit",
      time: "4:20 PM",
      date: "2 DAYS AGO",
    },
    {
      user: "Alex Rivera",
      action: "set priority to",
      detail: "High",
      task: "GSD-442: Design System Audit",
      time: "2:15 PM",
      date: "2 DAYS AGO",
    },
  ]

  const groupedActivities = activities.reduce((acc, activity) => {
    if (!acc[activity.date]) {
      acc[activity.date] = []
    }
    acc[activity.date].push(activity)
    return acc
  }, {} as Record<string, typeof activities>)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Activity</h1>
        <p className="text-[var(--text-muted)]">Track all changes and updates across your workspace.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          {Object.entries(groupedActivities).map(([date, items]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-[var(--text-muted)] mb-4">{date}</h3>
              <Card className="divide-y divide-[var(--border)]">
                {items.map((activity, index) => (
                  <div key={index} className="p-4">
                    <div className="flex gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {activity.user === "System" ? "⚙️" : activity.user.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-[var(--text)]">
                              <span className="font-semibold">{activity.user}</span>{' '}
                              {activity.action}{' '}
                              {activity.detail && (
                                <span className="font-semibold text-[var(--primary)]">{activity.detail}</span>
                              )}
                              {activity.automated && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Automated via Project Rules
                                </Badge>
                              )}
                            </p>
                            <p className="text-sm text-[var(--text-muted)] mt-1">{activity.task}</p>
                          </div>
                          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </span>
                        </div>
                        {activity.comment && (
                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-[var(--text)]">
                            <span className="font-medium">primary</span> {activity.comment}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Activity Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Tasks Created</span>
                <span className="font-semibold">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Status Changes</span>
                <span className="font-semibold">45</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Comments</span>
                <span className="font-semibold">89</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-muted)]">Attachments</span>
                <span className="font-semibold">12</span>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold mb-4">Most Active Members</h3>
            <div className="space-y-3">
              {["Alex Rivera", "Jane Doe", "Marcus Chen"].map((name, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{15 - i * 3} actions</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
