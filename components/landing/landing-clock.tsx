"use client"

import { Globe, Sun, Moon } from "lucide-react"
import { useClientNow } from "@/hooks/use-client-now"
import {
  CLOCK_PLACEHOLDER,
  formatZoneClock,
  INDIA_TIME_ZONE,
  US_TIME_ZONE,
} from "@/lib/world-clock"

export function LandingClock() {
  const now = useClientNow()
  const isPM = now ? now.getHours() >= 12 : true

  const indiaDisplay = now
    ? formatZoneClock(now, INDIA_TIME_ZONE, { withSeconds: true })
    : CLOCK_PLACEHOLDER
  const usDisplay = now
    ? formatZoneClock(now, US_TIME_ZONE, { withSeconds: true })
    : CLOCK_PLACEHOLDER

  return (
    <div className="hidden items-center gap-4 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm lg:flex">
      {isPM ? <Moon className="h-4 w-4 text-[var(--primary)]" /> : <Sun className="h-4 w-4 text-[var(--secondary)]" />}
      <div className="h-5 w-px bg-[var(--border)]" />
      <Globe className="h-4 w-4 text-[var(--text-muted)]" />
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">IN</span>
          <span
            className="font-mono text-sm font-semibold tabular-nums text-[var(--heading)]"
            suppressHydrationWarning
          >
            {indiaDisplay}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">US</span>
          <span
            className="font-mono text-sm font-semibold tabular-nums text-[var(--heading)]"
            suppressHydrationWarning
          >
            {usDisplay}
          </span>
        </div>
      </div>
    </div>
  )
}
