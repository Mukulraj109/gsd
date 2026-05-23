"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  getTaskDetailAction,
  updateTaskAction,
  deleteTaskAction,
  closeTaskAction,
  addCommentAction,
} from "@/lib/actions/tasks"
import { BOARD_COLUMNS, statusToBadgeVariant } from "@/lib/constants/tasks"
import type { BoardStatus } from "@/lib/constants/tasks"
import { format } from "date-fns"
import { Loader2, Paperclip, ChevronDown, ChevronUp } from "lucide-react"
import { AttachmentList, type AttachmentData } from "./attachment-list"
import { AttachmentUpload } from "./attachment-upload"

type Member = { id: string; name: string | null; email: string }
type Project = { id: string; name: string }

type TaskDraft = {
  description: string
  status: BoardStatus
  priority: string
  assigneeId: string
  projectId: string
  dueDate: string
}

type Props = {
  taskId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  projects: Project[]
}

function taskToDraft(task: NonNullable<Awaited<ReturnType<typeof getTaskDetailAction>>>): TaskDraft {
  return {
    description: task.description ?? "",
    status: task.status as BoardStatus,
    priority: task.priority,
    assigneeId: task.assigneeId ?? "",
    projectId: task.projectId ?? "",
    dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
  }
}

function isDraftDirty(
  task: NonNullable<Awaited<ReturnType<typeof getTaskDetailAction>>>,
  draft: TaskDraft
): boolean {
  return (
    draft.description !== (task.description ?? "") ||
    draft.status !== task.status ||
    draft.priority !== task.priority ||
    (draft.assigneeId || null) !== (task.assigneeId ?? null) ||
    (draft.projectId || null) !== (task.projectId ?? null) ||
    draft.dueDate !== (task.dueDate ? task.dueDate.slice(0, 10) : "")
  )
}

export function TaskDetailPanel({ taskId, open, onOpenChange, members, projects }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [task, setTask] = useState<Awaited<ReturnType<typeof getTaskDetailAction>>>(null)
  const [draft, setDraft] = useState<TaskDraft | null>(null)
  const [comment, setComment] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showAttachments, setShowAttachments] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentData[]>([])
  const [attachmentsUploading, setAttachmentsUploading] = useState(false)

  useEffect(() => {
    if (!open || !taskId) {
      setTask(null)
      setDraft(null)
      setAttachments([])
      setError(null)
      return
    }
    startTransition(async () => {
      const data = await getTaskDetailAction(taskId)
      setTask(data)
      if (data) {
        setDraft(taskToDraft(data))
      }
      if (data?.attachments) {
        setAttachments(data.attachments as AttachmentData[])
      }
    })
  }, [open, taskId])

  const isDirty = useMemo(() => {
    if (!task || !draft) return false
    return isDraftDirty(task, draft)
  }, [task, draft])

  const requestClose = useCallback((): boolean => {
    if (attachmentsUploading) {
      if (!confirm("Files are still uploading. Close without waiting?")) {
        return false
      }
    }
    if (isDirty) {
      if (!confirm("You have unsaved changes. Discard them?")) {
        return false
      }
    }
    return true
  }, [attachmentsUploading, isDirty])

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next && !requestClose()) return
      onOpenChange(next)
    },
    [onOpenChange, requestClose]
  )

  const handleClose = useCallback(() => {
    if (requestClose()) onOpenChange(false)
  }, [onOpenChange, requestClose])

  if (!open || !taskId) return null

  function updateDraft(patch: Partial<TaskDraft>) {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  function saveTask() {
    if (!task || !draft || !isDirty) return
    setError(null)
    startTransition(async () => {
      try {
        await updateTaskAction({
          taskId: task.id,
          description: draft.description,
          status: draft.status,
          priority: draft.priority,
          assigneeId: draft.assigneeId || null,
          projectId: draft.projectId || null,
          dueDate: draft.dueDate || null,
        })
        const data = await getTaskDetailAction(taskId!)
        setTask(data)
        if (data) setDraft(taskToDraft(data))
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Save failed")
      }
    })
  }

  function postComment(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await addCommentAction(taskId!, comment)
      setComment("")
      const data = await getTaskDetailAction(taskId!)
      setTask(data)
      if (data) setDraft(taskToDraft(data))
      router.refresh()
    })
  }

  const refreshAttachments = () => {
    getTaskDetailAction(taskId!).then((data) => {
      if (data?.attachments) {
        setAttachments(data.attachments as AttachmentData[])
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-left text-xl">{task?.title ?? "Task details"}</DialogTitle>
          <DialogDescription>
            {task
              ? `${task.displayLabel} · Created by ${task.createdBy.name ?? task.createdBy.email}`
              : "Loading task information…"}
          </DialogDescription>
        </DialogHeader>

        {!task || !draft ? (
          <p className="py-6 text-center text-sm text-[var(--text-muted)]">Loading…</p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className="font-mono">{task.displayLabel}</span>
              <span>·</span>
              <span>Created by {task.createdBy.name ?? task.createdBy.email}</span>
              <span>·</span>
              <span>{format(task.createdAt, "MMM d, yyyy")}</span>
              {isDirty && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
                  Unsaved changes
                </span>
              )}
            </div>

            {error && <p className="text-sm text-[var(--error)]">{error}</p>}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-4 sm:col-span-2 lg:col-span-2">
                <div>
                  <Label>Description</Label>
                  <textarea
                    className="mt-1 w-full rounded-md border border-[var(--border)] p-2 text-sm"
                    rows={4}
                    value={draft.description}
                    disabled={pending}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                  />
                </div>

                <div>
                  <h3 className="mb-2 text-sm font-semibold">Notes & comments</h3>
                  <div className="max-h-48 space-y-3 overflow-y-auto rounded-lg border p-3">
                    {task.comments.length === 0 ? (
                      <p className="text-xs text-[var(--text-muted)]">No notes yet.</p>
                    ) : (
                      task.comments.map((c) => (
                        <div key={c.id} className="flex gap-2 text-sm">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">
                              {(c.user.name ?? c.user.email).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-xs">{c.user.name ?? c.user.email}</p>
                            <p className="text-[var(--text-body)]">{c.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={postComment} className="mt-2 flex gap-2">
                    <Input
                      placeholder="Write a comment…"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      disabled={pending}
                    />
                    <Button type="submit" size="sm" disabled={pending || !comment.trim()}>
                      Post
                    </Button>
                  </form>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-semibold">
                      <Paperclip className="h-4 w-4" />
                      Attachments
                      {attachments.length > 0 && (
                        <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs text-[var(--primary)]">
                          {attachments.length}
                        </span>
                      )}
                    </h3>
                    {attachments.length > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowAttachments(!showAttachments)}
                      >
                        {showAttachments ? (
                          <><ChevronUp className="h-4 w-4 mr-1" /> Hide</>
                        ) : (
                          <><ChevronDown className="h-4 w-4 mr-1" /> Show</>
                        )}
                      </Button>
                    )}
                  </div>

                  {showAttachments || attachments.length === 0 ? (
                    <div className="space-y-4">
                      <AttachmentUpload
                        taskId={taskId!}
                        onUploadComplete={refreshAttachments}
                        onUploadingChange={setAttachmentsUploading}
                        compact
                      />
                      <AttachmentList
                        attachments={attachments}
                        currentUserId={task.createdBy.id}
                        onDelete={refreshAttachments}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Status</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border px-2 text-sm"
                    value={draft.status}
                    disabled={pending}
                    onChange={(e) => updateDraft({ status: e.target.value as BoardStatus })}
                  >
                    {BOARD_COLUMNS.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border px-2 text-sm"
                    value={draft.priority}
                    disabled={pending}
                    onChange={(e) => updateDraft({ priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border px-2 text-sm"
                    value={draft.assigneeId}
                    disabled={pending}
                    onChange={(e) => updateDraft({ assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Due date</Label>
                  <Input
                    type="date"
                    className="mt-1"
                    value={draft.dueDate}
                    disabled={pending}
                    onChange={(e) => updateDraft({ dueDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Project</Label>
                  <select
                    className="mt-1 h-10 w-full rounded-md border px-2 text-sm"
                    value={draft.projectId}
                    disabled={pending}
                    onChange={(e) => updateDraft({ projectId: e.target.value })}
                  >
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <Badge variant={statusToBadgeVariant(draft.status)}>{draft.status}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
              <Button
                type="button"
                variant="ghost"
                className="text-[var(--error)]"
                disabled={pending}
                onClick={() => {
                  if (!confirm("Delete this task?")) return
                  startTransition(async () => {
                    await deleteTaskAction(task.id)
                    onOpenChange(false)
                    router.refresh()
                  })
                }}
              >
                Delete task
              </Button>
              <div className="flex gap-2">
                {task.status === "DONE" && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      startTransition(async () => {
                        await closeTaskAction(task.id)
                        onOpenChange(false)
                        router.refresh()
                      })
                    }}
                  >
                    Close task
                  </Button>
                )}
                <Button type="button" variant="outline" disabled={pending} onClick={handleClose}>
                  Close
                </Button>
                <Button
                  type="button"
                  disabled={pending || !isDirty || attachmentsUploading}
                  onClick={saveTask}
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
