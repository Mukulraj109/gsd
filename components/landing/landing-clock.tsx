"use client"

import { useEffect, useState } from "react"
import { format, addHours, addMinutes } from "date-fns"
import { Clock, Globe, Sun, Moon } from "lucide-react"

function getIndiaTime(date: Date) {
  return addMinutes(addHours(date, 5), 30)
}

function getUSTime(date: Date) {
  return addHours(date, -10)
}

export function LandingClock() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const indiaTime = getIndiaTime(currentTime)
  const usTime = getUSTime(currentTime)
  const isPM = currentTime.getHours() >= 12

  return (
    <div className="hidden items-center gap-4 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 shadow-sm backdrop-blur-sm lg:flex">
      {isPM ? <Moon className="h-4 w-4 text-[var(--primary)]" /> : <Sun className="h-4 w-4 text-[var(--secondary)]" />}
      <div className="h-5 w-px bg-[var(--border)]" />
      <Globe className="h-4 w-4 text-[var(--text-muted)]" />
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">IN</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--heading)]">
            {format(indiaTime, "hh:mm:ss a")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
          <span className="text-xs font-medium text-[var(--text-muted)]">US</span>
          <span className="font-mono text-sm font-semibold tabular-nums text-[var(--heading)]">
            {format(usTime, "hh:mm:ss a")}
          </span>
        </div>
      </div>
    </div>
  )
}
