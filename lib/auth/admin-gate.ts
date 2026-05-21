import { cookies } from "next/headers"
import { createHmac, timingSafeEqual } from "crypto"

const COOKIE_NAME = "gsd_admin_gate"
const TTL_MS = 30 * 60 * 1000

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("hex")
}

export function createAdminGateToken(userId: string): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) throw new Error("Missing NEXTAUTH_SECRET")
  const exp = Date.now() + TTL_MS
  const payload = `${userId}:${exp}`
  return `${payload}.${sign(payload, secret)}`
}

export function verifyAdminGateToken(token: string, userId: string): boolean {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) return false
  const [payload, sig] = token.split(".")
  if (!payload || !sig) return false
  const expected = sign(payload, secret)
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false
  } catch {
    return false
  }
  const [uid, expStr] = payload.split(":")
  if (uid !== userId) return false
  const exp = Number(expStr)
  if (!exp || Date.now() > exp) return false
  return true
}

export async function setAdminGateCookie(userId: string) {
  const token = createAdminGateToken(userId)
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_MS / 1000,
  })
}

export async function clearAdminGateCookie() {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export async function hasValidAdminGate(userId: string): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminGateToken(token, userId)
}

export function isAdminPinConfigured(): boolean {
  return Boolean(process.env.ADMIN_GATE_PIN?.trim())
}
