"use client"

import { useEffect, useState } from "react"

/** Avoid hydration mismatch: live clocks render only after mount. */
export function useClientNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())
    const timer = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(timer)
  }, [intervalMs])

  return now
}
