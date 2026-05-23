"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Settings, Users, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const adminNav: { name: string; href: string; icon: LucideIcon }[] = [
  { name: "Team Directory", href: "/admin/team", icon: Users },
  { name: "Activity", href: "/admin/activity", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-3">
      {adminNav.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
              isActive
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-body)] hover:bg-gray-100"
            )}
          >
            <item.icon className="h-6 w-6 shrink-0" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )
}
