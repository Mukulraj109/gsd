"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  pointerWithin,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, MoreVertical, MessageSquare, Paperclip, GripVertical } from "lucide-react"
import {
  BOARD_COLUMNS,
  TASK_STATUSES,
  type TaskStatus,
  priorityLabel,
  statusToBadgeVariant,
} from "@/lib/constants/tasks"
import type { BoardTaskRow } from "@/lib/queries/board"
import {
  createTaskAction,
  persistBoardOrderAction,
  updateTaskStatusAction,
  type BoardPositionUpdate,
} from "@/lib/actions/tasks"

type Props = { initialTasks: BoardTaskRow[]; projectNames: string[] }

function toColumns(tasks: BoardTaskRow[]): Record<TaskStatus, BoardTaskRow[]> {
  const map = {} as Record<TaskStatus, BoardTaskRow[]>
  for (const s of TASK_STATUSES) map[s] = []
  for (const t of tasks) {
    const st = (TASK_STATUSES as readonly string[]).includes(t.status) ? (t.status as TaskStatus) : "TODO"
    map[st].push(t)
  }
  return map
}

function flattenUpdates(cols: Record<TaskStatus, BoardTaskRow[]>): BoardPositionUpdate[] {
  const updates: BoardPositionUpdate[] = []
  for (const st of TASK_STATUSES) {
    cols[st].forEach((t, i) => {
      updates.push({ id: t.id, status: st, position: i })
    })
  }
  return updates
}

function cloneCols(cols: Record<TaskStatus, BoardTaskRow[]>): Record<TaskStatus, BoardTaskRow[]> {
  const n = {} as Record<TaskStatus, BoardTaskRow[]>
  for (const s of TASK_STATUSES) n[s] = [...cols[s]]
  return n
}

function moveBoard(
  cols: Record<TaskStatus, BoardTaskRow[]>,
  activeId: string,
  overId: string
): Record<TaskStatus, BoardTaskRow[]> | null {
  if (activeId === overId) return null

  let moving: BoardTaskRow | undefined
  for (const s of TASK_STATUSES) {
    const t = cols[s].find((x) => x.id === activeId)
    if (t) {
      moving = t
      break
    }
  }
  if (!moving) return null

  const next = cloneCols(cols)
  for (const s of TASK_STATUSES) next[s] = next[s].filter((x) => x.id !== activeId)

  const overIsColumn = (TASK_STATUSES as readonly string[]).includes(overId)
  if (overIsColumn) {
    const to = overId as TaskStatus
    next[to].push({ ...moving, status: to })
    return next
  }

  for (const s of TASK_STATUSES) {
    const idx = next[s].findIndex((x) => x.id === overId)
    if (idx >= 0) {
      const arr = [...next[s]]
      arr.splice(idx, 0, { ...moving, status: s })
      next[s] = arr
      return next
    }
  }
  return null
}

function formatDue(iso: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startDue = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  if (startDue.getTime() === startToday.getTime()) return "Today"
  if (startDue < startToday)
    return { text: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), overdue: true }
  return { text: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }), overdue: false }
}

function DroppableColumn({ id, children }: { id: TaskStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[220px] flex-1 space-y-3 rounded-b-lg bg-gray-50 p-3 ${isOver ? "ring-2 ring-[var(--primary)] ring-offset-1" : ""}`}
    >
      {children}
    </div>
  )
}

function DraggableTask({
  task,
  columnTitle,
  pending,
  onStatusChange,
}: {
  task: BoardTaskRow
  columnTitle: string
  pending: boolean
  onStatusChange: (taskId: string, value: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.45 : 1 }
  const due = formatDue(task.dueDate)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm"
    >
      <div className="mb-2 flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 cursor-grab touch-none text-[var(--text-muted)] hover:text-[var(--text)] active:cursor-grabbing"
          aria-label="Drag task"
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <Badge variant="outline" className="max-w-[120px] truncate font-mono text-xs">
              {task.id.slice(0, 8)}…
            </Badge>
            {task.priority === "HIGH" && (
              <Badge variant="error" className="shrink-0 text-xs">
                High
              </Badge>
            )}
          </div>
          <h4 className="mb-2 font-medium text-[var(--text)]">{task.title}</h4>
          {task.description ? (
            <p className="mb-2 line-clamp-3 text-xs leading-relaxed text-[var(--text-muted)]">{task.description}</p>
          ) : null}
          {task.projectName && <p className="mb-2 text-xs text-[var(--text-muted)]">{task.projectName}</p>}
          {task.createdBy && (
            <p className="mb-2 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="font-medium text-[var(--text)]">Created by</span>
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">{task.createdBy.initials}</AvatarFallback>
              </Avatar>
              <span>{task.createdBy.label}</span>
            </p>
          )}
          <div className="mb-2">
            <label className="sr-only" htmlFor={`st-${task.id}`}>
              Status
            </label>
            <select
              id={`st-${task.id}`}
              className="w-full rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs"
              value={task.status}
              disabled={pending}
              onChange={(e) => onStatusChange(task.id, e.target.value)}
            >
              {BOARD_COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {task.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              {task.commentCount > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <MessageSquare className="h-3 w-3" />
                  {task.commentCount}
                </span>
              )}
              {task.attachmentCount > 0 && (
                <span className="flex items-center gap-1 text-xs">
                  <Paperclip className="h-3 w-3" />
                  {task.attachmentCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant="outline" className="text-[10px]">
              {priorityLabel(task.priority)}
            </Badge>
            <Badge variant={statusToBadgeVariant(task.status)} className="text-[10px]">
              {columnTitle}
            </Badge>
          </div>
          {due && (
            <div
              className={`mt-2 text-xs ${
                typeof due === "object" && due.overdue ? "text-[var(--error)]" : "text-[var(--text-muted)]"
              }`}
            >
              {typeof due === "string" ? `📅 ${due}` : `${due.overdue ? "⚠️ " : "📅 "}${due.text}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function BoardClient({ initialTasks, projectNames }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [columns, setColumns] = useState(() => toColumns(initialTasks))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [addingFor, setAddingFor] = useState<TaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL")
  const [projectFilter, setProjectFilter] = useState<string>("ALL")

  useEffect(() => {
    startTransition(() => {
      setColumns(toColumns(initialTasks))
    })
  }, [initialTasks, startTransition])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const filteredColumns = useMemo(() => {
    const out = cloneCols(columns)
    for (const s of TASK_STATUSES) {
      out[s] = out[s].filter((t) => {
        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false
        if (projectFilter !== "ALL" && (t.projectName ?? "") !== projectFilter) return false
        return true
      })
    }
    return out
  }, [columns, priorityFilter, projectFilter])

  const activeTask = useMemo(() => {
    if (!activeId) return null
    for (const s of TASK_STATUSES) {
      const t = columns[s].find((x) => x.id === activeId)
      if (t) return t
    }
    return null
  }, [activeId, columns])

  const onStatusChange = useCallback(
    (taskId: string, value: string) => {
      startTransition(async () => {
        await updateTaskStatusAction(taskId, value as TaskStatus)
        router.refresh()
      })
    },
    [router, startTransition]
  )

  function submitNewTask(columnStatus: TaskStatus) {
    const t = newTitle.trim()
    if (!t) return
    startTransition(async () => {
      await createTaskAction({ title: t, status: columnStatus })
      setNewTitle("")
      setAddingFor(null)
      router.refresh()
    })
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
  }

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const aid = String(active.id)
    const oid = String(over.id)
    const next = moveBoard(columns, aid, oid)
    if (!next) return
    setColumns(next)
    const updates = flattenUpdates(next)
    startTransition(async () => {
      await persistBoardOrderAction(updates)
      router.refresh()
    })
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[var(--heading)]">Task Board</h1>
          <p className="text-[var(--text-muted)]">Drag tasks between columns. Filters apply to the view only.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-[var(--text-muted)]" />
          <select
            className="h-9 rounded-md border border-[var(--border)] bg-white px-2 text-sm"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            aria-label="Filter by priority"
          >
            <option value="ALL">All priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select
            className="h-9 rounded-md border border-[var(--border)] bg-white px-2 text-sm"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            aria-label="Filter by project"
          >
            <option value="ALL">All projects</option>
            {projectNames.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto">
          <div className="inline-flex h-full gap-4 pb-4" style={{ minWidth: "100%" }}>
            {BOARD_COLUMNS.map((column) => {
              const colTasks = filteredColumns[column.id] ?? []
              return (
                <div key={column.id} className="flex w-80 flex-col">
                  <div
                    className={`flex items-center justify-between rounded-t-lg border-t-4 ${column.color} bg-white p-4`}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[var(--text)]">{column.title}</h3>
                      <Badge variant="outline">{colTasks.length}</Badge>
                    </div>
                    <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text)]">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  <DroppableColumn id={column.id}>
                    {colTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        columnTitle={column.title}
                        pending={pending}
                        onStatusChange={onStatusChange}
                      />
                    ))}
                    {addingFor === column.id ? (
                      <div className="space-y-2 rounded-lg border border-[var(--border)] bg-white p-3">
                        <Input
                          placeholder="Task title"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          disabled={pending}
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button type="button" size="sm" disabled={pending} onClick={() => submitNewTask(column.id)}>
                            Add
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setAddingFor(null)
                              setNewTitle("")
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50"
                        disabled={pending}
                        onClick={() => {
                          setAddingFor(column.id)
                          setNewTitle("")
                        }}
                      >
                        + Add card
                      </button>
                    )}
                  </DroppableColumn>
                </div>
              )
            })}
          </div>
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="max-w-xs rounded-lg border border-[var(--border)] bg-white p-3 shadow-lg">
              <p className="text-sm font-medium">{activeTask.title}</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
