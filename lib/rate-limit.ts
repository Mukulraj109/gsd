/**
 * Simple in-memory rate limiter (per Node process). Suitable for single-instance deploys.
 * For horizontal scale, replace with Redis/Upstash.
 */
const buckets = new Map<string, number[]>()

function clientKey(req: Request, bucket: string): string {
  const h = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")?.trim()
    || "unknown"
  return `${bucket}:${h}`
}

/** Returns true if allowed, false if rate limited */
export function rateLimitAllow(req: Request, bucket: string, max: number, windowMs: number): boolean {
  const key = clientKey(req, bucket)
  const now = Date.now()
  const windowStart = now - windowMs
  let stamps = buckets.get(key) ?? []
  stamps = stamps.filter((t) => t > windowStart)
  if (stamps.length >= max) {
    buckets.set(key, stamps)
    return false
  }
  stamps.push(now)
  buckets.set(key, stamps)
  return true
}
