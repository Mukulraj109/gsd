"use client"

import { Search, Bell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-white px-6">
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search tasks, IDs, or members..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="default" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Task
        </Button>
        <button className="relative rounded-lg p-2 hover:bg-gray-100">
          <Bell className="h-5 w-5 text-[var(--text)]" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--error)]"></span>
        </button>
        <button className="rounded-lg p-2 hover:bg-gray-100">
          <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium">
            AD
          </div>
        </button>
      </div>
    </header>
  )
}
