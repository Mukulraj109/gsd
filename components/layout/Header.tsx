"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Search, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createTaskAction } from "@/lib/actions/tasks"

export function Header() {
  const router = useRouter()
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [pending, startTransition] = useTransition()
  const user = session?.user
  const initials = (user?.name ?? user?.email ?? "U")
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  function submitTask(e: React.FormEvent) {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    startTransition(async () => {
      await createTaskAction(t)
      setTitle("")
      setOpen(false)
      router.refresh()
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
        {open ? (
          <form onSubmit={submitTask} className="flex items-center gap-2">
            <Input
              placeholder="New task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-56"
              disabled={pending}
              autoFocus
            />
            <Button type="submit" size="sm" disabled={pending}>
              Save
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </form>
        ) : (
          <Button type="button" className="gap-2" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        )}
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
