import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimitAllow } from "@/lib/rate-limit"

const bodySchema = z.object({
  token: z.string().min(10).max(200),
  password: z.string().min(8).max(128),
})

export async function POST(req: Request) {
  if (!rateLimitAllow(req, "reset-password", 10, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const { token, password } = parsed.data

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record || !record.identifier.startsWith("reset:")) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 })
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } })
    return NextResponse.json({ error: "Link expired" }, { status: 400 })
  }

  const email = record.identifier.slice("reset:".length)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "Invalid link" }, { status: 400 })
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { password: hashed } }),
    prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } }),
  ])

  return NextResponse.json({ ok: true })
}
