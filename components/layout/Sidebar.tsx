"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Kanban, Users, Settings, Activity, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Task Board", href: "/board", icon: Kanban },
  { name: "Team Directory", href: "/team", icon: Users },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const user = session?.user
  const label = user?.name ?? user?.email ?? "User"
  const initials = label
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-screen w-64 flex-col border-r border-[var(--border)] bg-white">
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] font-bold text-white">
            G
          </div>
          <span className="text-xl font-semibold text-[var(--heading)]">GSD</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive ? "bg-[var(--primary)] text-white" : "text-[var(--text)] hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--secondary)] font-medium text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--text)]">{label}</p>
            <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
