"use client"

import { useDroppable } from "@dnd-kit/core"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { BoardStatus } from "@/lib/constants/tasks"

export type BoardColumnDef = {
  id: BoardStatus
  title: string
  color: string
}

type Props = {
  column: BoardColumnDef
  taskCount: number
  isEmpty: boolean
  children: React.ReactNode
  footer: React.ReactNode
}

/** One Kanban column: fixed header + scrollable body (~4 cards tall on mobile). */
export function BoardColumn({ column, taskCount, isEmpty, children, footer }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <section
      aria-labelledby={`board-col-${column.id}`}
      className="flex w-full shrink-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm"
    >
      <div
        id={`board-col-${column.id}`}
        className={cn(
          "flex shrink-0 items-center gap-2 border-l-4 bg-white px-3 py-3 sm:px-4",
          column.color,
          "xl:border-l-transparent xl:border-t-4"
        )}
      >
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold text-[var(--heading)] sm:text-lg">
          {column.title}
        </h3>
        <Badge variant="outline" className="shrink-0 tabular-nums">
          {taskCount}
        </Badge>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "scrollbar-subtle board-column-scroll shrink-0 space-y-2 overflow-y-auto overscroll-y-contain bg-[var(--background)] p-2 sm:space-y-3 sm:p-3",
          "min-h-[5rem] max-h-[30rem]",
          "xl:min-h-[12rem] xl:max-h-none xl:flex-1",
          isOver && "ring-2 ring-inset ring-[var(--primary)]"
        )}
      >
        {isEmpty ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">No tasks here yet</p>
        ) : (
          children
        )}
        {footer}
      </div>
    </section>
  )
}
