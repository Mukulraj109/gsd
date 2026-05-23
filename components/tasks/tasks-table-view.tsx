import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { statusToBadgeVariant, priorityLabel } from "@/lib/constants/tasks"
import type { TaskTableRow } from "@/lib/queries/tasks-table"

type Props = {
  tasks: TaskTableRow[]
  boardHref: string
}

export function TasksTableView({ tasks, boardHref }: Props) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-xl border border-[var(--border)] bg-white px-5 py-10 text-center text-base text-[var(--text-muted)]">
        No tasks in this view.
      </p>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] bg-white lg:block">
        <table className="w-full text-base">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-[var(--heading)]">
              <th className="px-5 py-4 text-base font-semibold">ID</th>
              <th className="px-5 py-4 text-base font-semibold">Title</th>
              <th className="px-5 py-4 text-base font-semibold">Status</th>
              <th className="px-5 py-4 text-base font-semibold">Priority</th>
              <th className="px-5 py-4 text-base font-semibold">Assignee</th>
              <th className="px-5 py-4 text-base font-semibold">Created by</th>
              <th className="px-5 py-4 text-base font-semibold">Due</th>
              <th className="px-5 py-4 text-base font-semibold">Project</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id} className="border-b border-[var(--border)] hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-sm">{t.displayLabel}</td>
                <td className="px-5 py-4">
                  <Link href={boardHref} className="font-semibold text-[var(--primary)] hover:underline">
                    {t.title}
                  </Link>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={statusToBadgeVariant(t.status)}>{t.status.replaceAll("_", " ")}</Badge>
                </td>
                <td className="px-5 py-4">{priorityLabel(t.priority)}</td>
                <td className="px-5 py-4">{t.assigneeLabel}</td>
                <td className="px-5 py-4">{t.createdByLabel}</td>
                <td className="px-5 py-4">
                  {t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "—"}
                </td>
                <td className="px-5 py-4">{t.projectName ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 lg:hidden">
        {tasks.map((t) => (
          <article
            key={t.id}
            className="space-y-3 rounded-xl border border-[var(--border)] bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link href={boardHref} className="text-base font-semibold text-[var(--primary)] hover:underline">
                  {t.title}
                </Link>
                <p className="mt-1 font-mono text-xs text-[var(--text-muted)]">{t.displayLabel}</p>
              </div>
              <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
                <Badge variant={statusToBadgeVariant(t.status)} className="text-xs">
                  {t.status.replaceAll("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {priorityLabel(t.priority)}
                </Badge>
              </div>
            </div>
            <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--text-muted)]">Assignee</dt>
                <dd className="font-medium text-[var(--text-body)]">{t.assigneeLabel}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Created by</dt>
                <dd className="font-medium text-[var(--text-body)]">{t.createdByLabel}</dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Due</dt>
                <dd className="font-medium text-[var(--text-body)]">
                  {t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--text-muted)]">Project</dt>
                <dd className="font-medium text-[var(--text-body)]">{t.projectName ?? "—"}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}
