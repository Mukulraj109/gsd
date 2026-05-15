"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Search, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createTaskAction } from "@/lib/actions/tasks"
import { cn } from "@/lib/utils"

export type TaskFormProjectOption = { id: string; name: string }
export type TaskFormMemberOption = { id: string; name: string | null; email: string }

type Props = {
  projects: TaskFormProjectOption[]
  members: TaskFormMemberOption[]
}

export function Header({ projects, members }: Props) {
  const router = useRouter()
  const { data: session } = useSession()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("MEDIUM")
  const [dueDate, setDueDate] = useState("")
  const [projectId, setProjectId] = useState("")
  const [assigneeId, setAssigneeId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const user = session?.user
  const assigneeOptions = useMemo((): TaskFormMemberOption[] => {
    if (members.length > 0) return members
    if (user?.id) return [{ id: user.id, name: user.name ?? null, email: user.email ?? "" }]
    return []
  }, [members, user?.id, user?.name, user?.email])
  const initials = (user?.name ?? user?.email ?? "U")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  useEffect(() => {
    if (!dialogOpen) return
    setTitle("")
    setDescription("")
    setPriority("MEDIUM")
    setDueDate("")
    setProjectId(projects[0]?.id ?? "")
    setAssigneeId(session?.user?.id ?? "")
    setError(null)
  }, [dialogOpen, projects, session?.user?.id])

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setError(null)
    startTransition(async () => {
      try {
        await createTaskAction({
          title: t,
          status: "TODO",
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate.trim() || null,
          projectId: projectId.trim() === "" ? null : projectId,
          assignDefaultProject: false,
          assigneeId: assigneeId.trim() === "" ? null : assigneeId,
        })
        setDialogOpen(false)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create task.")
      }
    })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-white px-6">
      <div className="flex max-w-xl flex-1 items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input placeholder="Search tasks, IDs, or members…" className="pl-10" disabled />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button type="button" className="gap-2" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Task
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
            <form onSubmit={submitTask}>
              <DialogHeader>
                <DialogTitle>New task</DialogTitle>
                <DialogDescription>Add details now, or leave optional fields empty.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                {error && <p className="text-sm text-[var(--error)]">{error}</p>}
                <div className="grid gap-2">
                  <Label htmlFor="task-title">Title</Label>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    required
                    disabled={pending}
                    autoFocus
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-desc">Description (optional)</Label>
                  <textarea
                    id="task-desc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    disabled={pending}
                    className={cn(
                      "flex w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:opacity-50"
                    )}
                    placeholder="Context, links, acceptance criteria…"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <select
                      id="task-priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      disabled={pending}
                      className="h-10 rounded-md border border-[var(--border)] bg-white px-2 text-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="task-due">Due date (optional)</Label>
                    <Input
                      id="task-due"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      disabled={pending}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-project">Project (optional)</Label>
                  <select
                    id="task-project"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={pending}
                    className="h-10 rounded-md border border-[var(--border)] bg-white px-2 text-sm"
                  >
                    <option value="">No project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="task-assignee">Assignee</Label>
                  <select
                    id="task-assignee"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    disabled={pending}
                    className="h-10 rounded-md border border-[var(--border)] bg-white px-2 text-sm"
                  >
                    {assigneeOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name?.trim() ? m.name : m.email}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={pending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Saving…" : "Create task"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <button type="button" className="relative rounded-lg p-2 hover:bg-gray-100" aria-label="Notifications" disabled>
          <Bell className="h-5 w-5 text-[var(--text)]" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[var(--error)]" />
        </button>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-medium text-white"
          title="Sign out"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
