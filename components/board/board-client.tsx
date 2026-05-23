"use client"

import { useCallback, useEffect, useMemo, useState, useTransition, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
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
import { Filter, MessageSquare, Paperclip, GripVertical, ChevronDown, ChevronUp } from "lucide-react"
import {
  BOARD_COLUMNS,
  BOARD_STATUSES,
  type BoardStatus,
  priorityLabel,
  statusToBadgeVariant,
} from "@/lib/constants/tasks"
import type { BoardTaskRow } from "@/lib/queries/board"
import {
  createTaskAction,
  persistBoardOrderAction,
  updateTaskStatusAction,
  closeTaskAction,
  type BoardPositionUpdate,
} from "@/lib/actions/tasks"
import { TaskDetailPanel } from "@/components/tasks/task-detail-panel"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { BoardColumn } from "@/components/board/board-column"

type Member = { id: string; name: string | null; email: string }
type Project = { id: string; name: string }

type Props = {
  initialTasks: BoardTaskRow[]
  projectNames: string[]
  members: Member[]
  projects: Project[]
  browseProjectId?: string | null
}

function toColumns(tasks: BoardTaskRow[]): Record<BoardStatus, BoardTaskRow[]> {
  const map = {} as Record<BoardStatus, BoardTaskRow[]>
  for (const s of BOARD_STATUSES) map[s] = []
  for (const t of tasks) {
    const st = (BOARD_STATUSES as readonly string[]).includes(t.status) ? (t.status as BoardStatus) : "TODO"
    map[st].push(t)
  }
  return map
}

function flattenUpdates(cols: Record<BoardStatus, BoardTaskRow[]>): BoardPositionUpdate[] {
  const updates: BoardPositionUpdate[] = []
  for (const st of BOARD_STATUSES) {
    cols[st].forEach((t, i) => {
      updates.push({ id: t.id, status: st, position: i })
    })
  }
  return updates
}

function cloneCols(cols: Record<BoardStatus, BoardTaskRow[]>): Record<BoardStatus, BoardTaskRow[]> {
  const n = {} as Record<BoardStatus, BoardTaskRow[]>
  for (const s of BOARD_STATUSES) n[s] = [...cols[s]]
  return n
}

function moveBoard(
  cols: Record<BoardStatus, BoardTaskRow[]>,
  activeId: string,
  overId: string
): Record<BoardStatus, BoardTaskRow[]> | null {
  if (activeId === overId) return null

  let moving: BoardTaskRow | undefined
  for (const s of BOARD_STATUSES) {
    const t = cols[s].find((x) => x.id === activeId)
    if (t) {
      moving = t
      break
    }
  }
  if (!moving) return null

  const next = cloneCols(cols)
  for (const s of BOARD_STATUSES) next[s] = next[s].filter((x) => x.id !== activeId)

  const overIsColumn = (BOARD_STATUSES as readonly string[]).includes(overId)
  if (overIsColumn) {
    const to = overId as BoardStatus
    next[to].push({ ...moving, status: to })
    return next
  }

  for (const s of BOARD_STATUSES) {
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

function DraggableTask({
  task,
  columnTitle,
  pending,
  onStatusChange,
  onOpen,
  onClose,
}: {
  task: BoardTaskRow
  columnTitle: string
  pending: boolean
  onStatusChange: (taskId: string, value: string) => void
  onOpen: () => void
  onClose: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.45 : 1 }
  const due = formatDue(task.dueDate)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="cursor-pointer rounded-lg border border-[var(--border)] bg-white p-3 shadow-sm sm:p-4 lg:p-5"
      onClick={onOpen}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className="mt-0.5 shrink-0 cursor-grab touch-none text-[var(--text-muted)] hover:text-[var(--text)] active:cursor-grabbing"
          aria-label="Drag task"
          onClick={(e) => e.stopPropagation()}
          {...listeners}
          {...attributes}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="max-w-full truncate font-mono text-xs">
              {task.displayLabel}
            </Badge>
            {task.priority === "HIGH" && (
              <Badge variant="error" className="shrink-0 text-xs">
                High
              </Badge>
            )}
            <Badge variant="outline" className="text-xs lg:hidden">
              {priorityLabel(task.priority)}
            </Badge>
          </div>
          <h4 className="mb-1.5 break-words text-sm font-semibold leading-snug text-[var(--heading)] sm:text-base">
            {task.title}
          </h4>
          {task.description ? (
            <p className="mb-1.5 hidden line-clamp-2 text-sm leading-relaxed text-[var(--text-muted)] sm:block">
              {task.description}
            </p>
          ) : null}
          {task.projectName && (
            <p className="mb-1.5 truncate text-xs text-[var(--text-muted)] sm:text-sm">{task.projectName}</p>
          )}
          {task.createdBy && (
            <div className="mb-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)] sm:text-sm">
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarFallback className="text-[10px]">{task.createdBy.initials}</AvatarFallback>
              </Avatar>
              <span className="truncate">{task.createdBy.label}</span>
            </div>
          )}
          <div className="mb-1.5" onClick={(e) => e.stopPropagation()}>
            <label className="sr-only" htmlFor={`st-${task.id}`}>
              Status
            </label>
            <select
              id={`st-${task.id}`}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-white px-2 text-sm"
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
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {task.assignee && (
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[var(--text-muted)]">
              {task.commentCount > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <MessageSquare className="h-4 w-4" />
                  {task.commentCount}
                </span>
              )}
              {task.attachmentCount > 0 && (
                <span className="flex items-center gap-1 text-sm">
                  <Paperclip className="h-4 w-4" />
                  {task.attachmentCount}
                </span>
              )}
            </div>
          </div>
          <div className="mt-1.5 hidden flex-wrap gap-1 lg:flex">
            <Badge variant="outline" className="text-xs">
              {priorityLabel(task.priority)}
            </Badge>
            <Badge variant={statusToBadgeVariant(task.status)} className="text-xs">
              {columnTitle}
            </Badge>
          </div>
          {due && (
            <div
              className={`mt-2 text-sm ${
                typeof due === "object" && due.overdue ? "text-[var(--error)]" : "text-[var(--text-muted)]"
              }`}
            >
              {typeof due === "string" ? `📅 ${due}` : `${due.overdue ? "⚠️ " : "📅 "}${due.text}`}
            </div>
          )}
          {task.status === "DONE" && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2 w-full"
              disabled={pending}
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
            >
              Close task
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function BoardClient({
  initialTasks,
  projectNames,
  members,
  projects,
  browseProjectId = null,
}: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [columns, setColumns] = useState(() => toColumns(initialTasks))
  const [activeId, setActiveId] = useState<string | null>(null)
  const [addingFor, setAddingFor] = useState<BoardStatus | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "HIGH" | "MEDIUM" | "LOW">("ALL")
  const [projectFilter, setProjectFilter] = useState<string>("ALL")
  const [nameQuery, setNameQuery] = useState("")
  const [createdByFilter, setCreatedByFilter] = useState("ALL")
  const [assigneeFilter, setAssigneeFilter] = useState("ALL")
  const [dueFilter, setDueFilter] = useState("")
  const [detailId, setDetailId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const mounted = useRef(false)

  useEffect(() => {
    mounted.current = true
  }, [])

  useEffect(() => {
    startTransition(() => {
      setColumns(toColumns(initialTasks))
    })
  }, [initialTasks, startTransition])

  useEffect(() => {
    setCreatedByFilter("ALL")
    setAssigneeFilter("ALL")
  }, [browseProjectId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const filteredColumns = useMemo(() => {
    const out = cloneCols(columns)
    for (const s of BOARD_STATUSES) {
      out[s] = out[s].filter((t) => {
        if (priorityFilter !== "ALL" && t.priority !== priorityFilter) return false
        if (projectFilter !== "ALL" && (t.projectName ?? "") !== projectFilter) return false
        if (nameQuery.trim() && !t.title.toLowerCase().includes(nameQuery.trim().toLowerCase())) return false
        if (createdByFilter !== "ALL" && t.createdById !== createdByFilter) return false
        if (assigneeFilter !== "ALL" && t.assigneeId !== assigneeFilter) return false
        if (dueFilter) {
          const d = t.dueDate?.slice(0, 10)
          if (d !== dueFilter) return false
        }
        return true
      })
    }
    return out
  }, [columns, priorityFilter, projectFilter, nameQuery, createdByFilter, assigneeFilter, dueFilter])

  const activeTask = useMemo(() => {
    if (!activeId) return null
    for (const s of BOARD_STATUSES) {
      const t = columns[s].find((x) => x.id === activeId)
      if (t) return t
    }
    return null
  }, [activeId, columns])

  const onStatusChange = useCallback(
    (taskId: string, value: string) => {
      startTransition(async () => {
        await updateTaskStatusAction(taskId, value as BoardStatus)
        router.refresh()
      })
    },
    [router, startTransition]
  )

  function submitNewTask(columnStatus: BoardStatus) {
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
    <div className="flex flex-col gap-3 sm:gap-5 xl:min-h-0 xl:flex-1">
      <section className="shrink-0 rounded-xl border border-[var(--border)] bg-white p-3 shadow-sm sm:p-4 lg:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 hidden lg:block">
            <h2 className="text-xl font-semibold text-[var(--heading)] lg:text-2xl">Task Board</h2>
            <p className="text-sm text-[var(--text-muted)]">Drag cards between columns · click a card to edit</p>
          </div>
          <p className="text-xs text-[var(--text-muted)] lg:hidden">
            Four sections below — scroll inside a section when it has many tasks
          </p>
          <Button type="button" className="h-11 w-full shrink-0 sm:w-auto" onClick={() => setCreateOpen(true)}>
            + Create Task
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-10 w-full gap-2 text-sm lg:hidden"
          onClick={() => setFiltersOpen((o) => !o)}
          aria-expanded={filtersOpen}
        >
          <Filter className="h-4 w-4" />
          Filters
          {filtersOpen ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />}
        </Button>
        <div
          className={`mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:mt-4 lg:flex lg:flex-wrap lg:items-center lg:gap-3 ${filtersOpen ? "grid" : "hidden lg:flex"}`}
        >
          <Filter className="hidden h-5 w-5 shrink-0 text-[var(--text-muted)] lg:block" aria-hidden />
          <Input
            placeholder="Search by task name…"
            className="h-10 w-full min-w-0 sm:col-span-2 lg:max-w-xs lg:flex-1"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
          />
          <select
            className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-white px-3 text-sm lg:min-w-[9rem] lg:w-auto lg:text-base"
            value={createdByFilter}
            onChange={(e) => setCreatedByFilter(e.target.value)}
            aria-label="Created by"
          >
            <option value="ALL">Created by</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
            ))}
          </select>
          <select
            className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-white px-3 text-sm lg:min-w-[9rem] lg:w-auto lg:text-base"
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            aria-label="Assigned to"
          >
            <option value="ALL">Assigned to</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
            ))}
          </select>
          <Input
            type="date"
            className="h-10 w-full shrink-0 lg:w-44"
            value={dueFilter}
            onChange={(e) => setDueFilter(e.target.value)}
            aria-label="Due date"
          />
          <select
            className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-white px-3 text-sm lg:min-w-[9rem] lg:w-auto lg:text-base"
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
            className="h-10 w-full min-w-0 rounded-md border border-[var(--border)] bg-white px-3 text-sm lg:min-w-[9rem] lg:w-auto lg:text-base"
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
      </section>

      {mounted.current ? (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="w-full xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
            <div className="flex w-full flex-col gap-5 xl:grid xl:min-h-[calc(100vh-17rem)] xl:grid-cols-4 xl:items-stretch xl:gap-4">
              {BOARD_COLUMNS.map((column) => {
                const colTasks = filteredColumns[column.id] ?? []
                const addCardFooter =
                  addingFor === column.id ? (
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
                      className="w-full rounded-lg border-2 border-dashed border-gray-300 p-3 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] disabled:opacity-50 sm:p-4 sm:text-base"
                      disabled={pending}
                      onClick={() => {
                        setAddingFor(column.id)
                        setNewTitle("")
                      }}
                    >
                      + Add card
                    </button>
                  )

                return (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    taskCount={colTasks.length}
                    isEmpty={colTasks.length === 0}
                    footer={addCardFooter}
                  >
                    {colTasks.map((task) => (
                      <DraggableTask
                        key={task.id}
                        task={task}
                        columnTitle={column.title}
                        pending={pending}
                        onStatusChange={onStatusChange}
                        onOpen={() => setDetailId(task.id)}
                        onClose={() => {
                          startTransition(async () => {
                            await closeTaskAction(task.id)
                            router.refresh()
                          })
                        }}
                      />
                    ))}
                  </BoardColumn>
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
      ) : (
        <div className="flex min-h-[32rem] items-center justify-center">
          <p className="text-[var(--text-muted)]">Loading board...</p>
        </div>
      )}

      <TaskDetailPanel
        taskId={detailId}
        open={!!detailId}
        onOpenChange={(o) => !o && setDetailId(null)}
        members={members}
        projects={projects}
      />
      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        members={members}
        projects={projects}
        onTaskCreated={(taskId) => {
          setDetailId(taskId)
        }}
      />
    </div>
  )
}
