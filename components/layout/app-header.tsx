"use client"

import { Globe, Sun, Moon, Menu } from "lucide-react"
import { usePathname } from "next/navigation"
import { useClientNow } from "@/hooks/use-client-now"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  CLOCK_PLACEHOLDER,
  getZoneClockParts,
  INDIA_TIME_ZONE,
  US_TIME_ZONE,
} from "@/lib/world-clock"

export type TaskFormProjectOption = { id: string; name: string }
export type TaskFormMemberOption = { id: string; name: string | null; email: string }

type Props = {
  projects?: TaskFormProjectOption[]
  members?: TaskFormMemberOption[]
  pageTitle?: string
  showFilters?: boolean
  filterSlot?: React.ReactNode
  actionSlot?: React.ReactNode
  onMenuClick?: () => void
}

const ROUTE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/board": "Task Board",
  "/tasks": "Task Table",
}

export function AppHeader({
  pageTitle = "Get Stuff Done",
  filterSlot,
  actionSlot,
  onMenuClick,
}: Props) {
  const pathname = usePathname()
  const resolvedTitle = ROUTE_TITLES[pathname] ?? pageTitle
  const now = useClientNow()
  const isPM = now ? now.getHours() >= 12 : true

  const india = now
    ? getZoneClockParts(now, INDIA_TIME_ZONE, { withSeconds: true })
    : { time: CLOCK_PLACEHOLDER, meridiem: "" }
  const us = now
    ? getZoneClockParts(now, US_TIME_ZONE, { withSeconds: true })
    : { time: CLOCK_PLACEHOLDER, meridiem: "" }

  return (
    <header className="relative flex h-14 shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] bg-gradient-to-r from-white via-slate-50 to-white px-3 sm:h-16 lg:h-28 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onMenuClick ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 lg:hidden"
            aria-label="Open navigation menu"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <h1
          className={cn(
            "min-w-0 truncate text-base font-bold tracking-tight text-[var(--heading)] sm:text-lg lg:hidden"
          )}
        >
          {resolvedTitle}
        </h1>
        {filterSlot}
      </div>
      <h1
        className="pointer-events-none absolute left-1/2 hidden max-w-[40%] -translate-x-1/2 truncate text-2xl font-extrabold tracking-tight text-[var(--heading)] lg:block lg:max-w-none lg:whitespace-nowrap lg:text-5xl"
        style={{ textShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
      >
        {resolvedTitle}
      </h1>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
        {actionSlot}
        <div className="hidden items-center gap-4 rounded-2xl border border-[var(--border)] bg-gradient-to-br from-slate-50 via-white to-slate-50 px-5 py-3 shadow-md lg:flex">
          <div className="flex items-center gap-2 text-[var(--primary)]">
            {isPM ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </div>
          <div className="h-10 w-px bg-gradient-to-b from-transparent via-[var(--border)] to-transparent" />
          <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
            <Globe className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Time</span>
          </div>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <div className="mb-1 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--primary)]">India</span>
              </div>
              <span
                className="font-mono text-xl font-bold tracking-wide text-[var(--heading)] tabular-nums"
                suppressHydrationWarning
              >
                {india.time}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {india.meridiem || "\u00a0"}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-1 flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--secondary)]">US</span>
              </div>
              <span
                className="font-mono text-xl font-bold tracking-wide text-[var(--heading)] tabular-nums"
                suppressHydrationWarning
              >
                {us.time}
              </span>
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {us.meridiem || "\u00a0"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}


