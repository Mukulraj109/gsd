"use client"

import { Globe, Sun, Moon } from "lucide-react"
import { useClientNow } from "@/hooks/use-client-now"
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
}

export function AppHeader({
  pageTitle = "Get Stuff Done",
  filterSlot,
  actionSlot,
}: Props) {
  const now = useClientNow()
  const isPM = now ? now.getHours() >= 12 : true

  const india = now
    ? getZoneClockParts(now, INDIA_TIME_ZONE, { withSeconds: true })
    : { time: CLOCK_PLACEHOLDER, meridiem: "" }
  const us = now
    ? getZoneClockParts(now, US_TIME_ZONE, { withSeconds: true })
    : { time: CLOCK_PLACEHOLDER, meridiem: "" }

  return (
    <header className="relative flex h-24 shrink-0 items-center justify-between border-b border-[var(--border)] bg-gradient-to-r from-white via-slate-50 to-white px-4 lg:h-28 lg:px-8">
      <div className="flex min-w-0 flex-1 items-center">{filterSlot}</div>
      <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-3xl font-extrabold tracking-tight text-[var(--heading)] lg:text-5xl" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
        {pageTitle}
      </h1>
      <div className="flex min-w-0 flex-1 items-center justify-end gap-4">
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
