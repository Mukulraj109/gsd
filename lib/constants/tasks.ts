export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE", "CLOSED"] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

export const BOARD_STATUSES = ["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const
export type BoardStatus = (typeof BOARD_STATUSES)[number]

export const BOARD_COLUMNS: {
  id: BoardStatus
  title: string
  color: string
}[] = [
  { id: "TODO", title: "To Do", color: "border-gray-300" },
  { id: "IN_PROGRESS", title: "In Progress", color: "border-[var(--secondary)]" },
  { id: "REVIEW", title: "Review", color: "border-[var(--warning)]" },
  { id: "DONE", title: "Done", color: "border-[var(--success)]" },
]

export function statusToBadgeVariant(
  status: string
): "todo" | "in-progress" | "review" | "done" | "outline" {
  switch (status) {
    case "TODO":
      return "todo"
    case "IN_PROGRESS":
      return "in-progress"
    case "REVIEW":
      return "review"
    case "DONE":
      return "done"
    default:
      return "outline"
  }
}

export function priorityLabel(p: string) {
  return p.charAt(0) + p.slice(1).toLowerCase()
}
