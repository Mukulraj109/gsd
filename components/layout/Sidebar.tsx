"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Kanban, Users, Settings, Activity } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Task Board", href: "/board", icon: Kanban },
  { name: "Team Directory", href: "/team", icon: Users },
  { name: "Activity", href: "/activity", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-white border-r border-[var(--border)]">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold">
            G
          </div>
          <span className="text-xl font-semibold text-[var(--heading)]">GSD</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text)] hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="border-t border-[var(--border)] p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[var(--secondary)] flex items-center justify-center text-white font-medium">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text)] truncate">Admin User</p>
            <p className="text-xs text-[var(--text-muted)] truncate">admin@gsd.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}
