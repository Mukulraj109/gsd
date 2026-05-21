"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createTaskAction } from "@/lib/actions/tasks"
import { cn } from "@/lib/utils"

type Member = { id: string; name: string | null; email: string }
type Project = { id: string; name: string }

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: Member[]
  projects: Project[]
}

export function CreateTaskDialog({ open, onOpenChange, members, projects }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    setTitle("")
    setDescription("")
    setPriority("MEDIUM")
    setDueDate("")
    setProjectId(projects[0]?.id ?? "")
    setAssigneeId(members[0]?.id ?? "")
    setError(null)
  }, [open, projects, members])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setError(null)
    startTransition(async () => {
      try {
        await createTaskAction({
          title: t,
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate.trim() || null,
          projectId: projectId.trim() || null,
          assignDefaultProject: false,
          assigneeId: assigneeId.trim() || null,
        })
        onOpenChange(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create task")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Add task details for your team board.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            {error && <p className="text-sm text-[var(--error)]">{error}</p>}
            <div className="grid gap-2">
              <Label htmlFor="ct-title">Task title</Label>
              <Input id="ct-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={pending} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ct-desc">Description</Label>
              <textarea
                id="ct-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={pending}
                className={cn(
                  "w-full rounded-md border border-[var(--border)] px-3 py-2 text-sm"
                )}
                placeholder="Steps, requirements, links…"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Assigned to</Label>
                <select className="h-10 rounded-md border px-2 text-sm" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} disabled={pending}>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name ?? m.email}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} disabled={pending} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Priority</Label>
                <select className="h-10 rounded-md border px-2 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)} disabled={pending}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Project</Label>
                <select className="h-10 rounded-md border px-2 text-sm" value={projectId} onChange={(e) => setProjectId(e.target.value)} disabled={pending}>
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>{pending ? "Creating…" : "Create Task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
