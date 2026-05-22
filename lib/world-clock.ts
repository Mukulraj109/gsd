/** IST — India */
export const INDIA_TIME_ZONE = "Asia/Kolkata"
/** US Eastern (auto DST); replaces incorrect local offset math */
export const US_TIME_ZONE = "America/New_York"

export type ZoneClockParts = {
  time: string
  meridiem: string
}

export function getZoneClockParts(
  date: Date,
  timeZone: string,
  options?: { withSeconds?: boolean }
): ZoneClockParts {
  const withSeconds = options?.withSeconds ?? true
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    ...(withSeconds ? { second: "2-digit" } : {}),
    hour12: true,
  }).formatToParts(date)

  const hour = parts.find((p) => p.type === "hour")?.value ?? "00"
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00"
  const second = parts.find((p) => p.type === "second")?.value
  const meridiem = parts.find((p) => p.type === "dayPeriod")?.value ?? ""

  const time =
    withSeconds && second ? `${hour}:${minute}:${second}` : `${hour}:${minute}`

  return { time, meridiem }
}

export function formatZoneClock(
  date: Date,
  timeZone: string,
  options?: { withSeconds?: boolean }
): string {
  const { time, meridiem } = getZoneClockParts(date, timeZone, options)
  return meridiem ? `${time} ${meridiem}` : time
}

export const CLOCK_PLACEHOLDER = "--:--:--"
export const CLOCK_PLACEHOLDER_SHORT = "--:--"
