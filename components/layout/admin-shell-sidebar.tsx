"use client"

import Link from "next/link"
import Image from "next/image"
import { LogOut } from "lucide-react"
import { logoutAdminGateAction } from "@/lib/actions/admin-gate"
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav"
import { cn } from "@/lib/utils"

type Props = {
  className?: string
  onNavigate?: () => void
}

export function AdminShellSidebar({ className, onNavigate }: Props) {
  return (
    <aside
      className={cn(
        "flex h-full w-[17.5rem] shrink-0 flex-col border-r border-[var(--border)] bg-white lg:w-80",
        className
      )}
    >
      <div className="overflow-hidden border-b border-[var(--border)] px-3 py-2">
        <Link href="/dashboard" className="block leading-none" onClick={onNavigate}>
          <Image
            src="/brand/fst-logo.png"
            alt="FirstStep"
            width={320}
            height={112}
            className="-my-2 -ml-1 h-20 max-w-[calc(100%+0.5rem)] object-contain object-left lg:h-24"
            style={{ width: "auto" }}
          />
        </Link>
        <p className="mt-2 px-1 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          Admin Panel
        </p>
      </div>
      <AdminSidebarNav onNavigate={onNavigate} />
      <form action={logoutAdminGateAction} className="border-t border-[var(--border)] p-5">
        <button
          type="submit"
          className="flex h-11 w-full items-center gap-3 rounded-lg px-4 text-base font-medium text-[var(--text-body)] transition-colors hover:bg-gray-100"
        >
          <LogOut className="h-6 w-6 shrink-0" />
          Exit admin
        </button>
      </form>
    </aside>
  )
}
