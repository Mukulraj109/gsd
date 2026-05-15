import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Filter, MoreVertical, MessageSquare, Paperclip } from "lucide-react"

export default function BoardPage() {
  const columns = [
    { id: "todo", title: "To Do", count: 3, color: "border-gray-300" },
    { id: "in-progress", title: "In Progress", count: 2, color: "border-[var(--secondary)]" },
    { id: "review", title: "Review", count: 1, color: "border-[var(--warning)]" },
    { id: "done", title: "Done", count: 12, color: "border-[var(--success)]" },
  ]

  const tasks = {
    todo: [
      {
        id: "GSD-101",
        title: "Architecture Review for Project Zenith",
        category: "Admin",
        priority: "medium",
        dueDate: "Oct 24",
        assignee: { name: "Alex J.", initials: "AJ" },
      },
      {
        id: "GSD-105",
        title: "New Client Onboarding Flow",
        category: "Sales",
        priority: "high",
        dueDate: "Oct 20",
        assignee: { name: "Sam R.", initials: "SR" },
        overdue: true,
      },
      {
        id: "GSD-120",
        title: "Refine Dashboard Analytics UI",
        category: "Design",
        priority: "low",
        assignee: { name: "Jane D.", initials: "JD" },
        image: true,
      },
    ],
    "in-progress": [
      {
        id: "GSD-098",
        title: "API Integration for Payment Gateway",
        category: "Ops",
        priority: "high",
        dueDate: "Oct 26",
        assignee: { name: "M. Kross", initials: "MK" },
        progress: 65,
        comments: 4,
      },
      {
        id: "GSD-115",
        title: "System Migration Strategy",
        category: "Engineering",
        priority: "high",
        dueDate: "Oct 28",
        assignees: [
          { name: "User 1", initials: "U1" },
          { name: "User 2", initials: "U2" },
        ],
        progress: 65,
        comments: 2,
      },
    ],
    review: [
      {
        id: "GSD-092",
        title: "Final Branding Assets Approval",
        category: "Design",
        priority: "high",
        dueDate: "Today",
        assignee: { name: "Designer", initials: "DS" },
        comments: 4,
        attachments: 2,
      },
    ],
    done: [
      {
        id: "GSD-087",
        title: "Onboarding Flow Documentation",
        category: "Success",
        priority: "low",
        completedDate: "Completed Oct 20",
        assignee: { name: "User", initials: "US" },
      },
    ],
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--heading)]">Task Board</h1>
          <p className="text-[var(--text-muted)]">Manage and track your team's active work streams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto">
        <div className="inline-flex h-full gap-4 pb-4" style={{ minWidth: "100%" }}>
          {columns.map((column) => (
            <div key={column.id} className="flex w-80 flex-col">
              {/* Column Header */}
              <div className={`flex items-center justify-between rounded-t-lg border-t-4 ${column.color} bg-white p-4`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-[var(--text)]">{column.title}</h3>
                  <Badge variant="outline">{column.count}</Badge>
                </div>
                <button className="text-[var(--text-muted)] hover:text-[var(--text)]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Tasks */}
              <div className="flex-1 space-y-3 rounded-b-lg bg-gray-50 p-3">
                {tasks[column.id as keyof typeof tasks].map((task: any) => (
                  <div
                    key={task.id}
                    className="group cursor-pointer rounded-lg bg-white p-4 shadow-sm border border-[var(--border)] hover:shadow-md transition-shadow"
                  >
                    {/* Task Image */}
                    {task.image && (
                      <div className="mb-3 h-32 rounded-md bg-gradient-to-br from-blue-400 to-purple-500"></div>
                    )}

                    {/* Task Header */}
                    <div className="mb-2 flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        {task.id}
                      </Badge>
                      {task.priority === "high" && (
                        <Badge variant="error" className="text-xs">High</Badge>
                      )}
                    </div>

                    {/* Task Title */}
                    <h4 className="mb-2 font-medium text-[var(--text)]">{task.title}</h4>

                    {/* Progress Bar */}
                    {task.progress && (
                      <div className="mb-3">
                        <div className="h-2 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-[var(--secondary)]"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">{task.progress}% complete</p>
                      </div>
                    )}

                    {/* Task Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.assignee && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                          </Avatar>
                        )}
                        {task.assignees && (
                          <div className="flex -space-x-2">
                            {task.assignees.map((assignee: any, i: number) => (
                              <Avatar key={i} className="h-6 w-6 border-2 border-white">
                                <AvatarFallback className="text-xs">{assignee.initials}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--text-muted)]">
                        {task.comments && (
                          <span className="flex items-center gap-1 text-xs">
                            <MessageSquare className="h-3 w-3" />
                            {task.comments}
                          </span>
                        )}
                        {task.attachments && (
                          <span className="flex items-center gap-1 text-xs">
                            <Paperclip className="h-3 w-3" />
                            {task.attachments}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Due Date */}
                    {task.dueDate && (
                      <div className={`mt-2 text-xs ${task.overdue ? 'text-[var(--error)]' : 'text-[var(--text-muted)]'}`}>
                        {task.overdue ? '⚠️ ' : '📅 '}{task.dueDate}
                      </div>
                    )}
                    {task.completedDate && (
                      <div className="mt-2 text-xs text-[var(--success)]">
                        ✓ {task.completedDate}
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Card Button */}
                <button className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors">
                  + Add Card
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
