import { NextResponse } from "next/server"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimitAllow } from "@/lib/rate-limit"

const bodySchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  inviteToken: z.string().min(20).max(200).optional(),
})

export async function POST(req: Request) {
  if (!rateLimitAllow(req, "register", 10, 60 * 60 * 1000)) {
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
    return NextResponse.json(
      { error: "Invalid input", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const name = parsed.data.name.trim()
  const email = parsed.data.email.trim().toLowerCase()
  const password = parsed.data.password
  const inviteToken = parsed.data.inviteToken

  if (inviteToken) {
    const inv = await prisma.verificationToken.findUnique({ where: { token: inviteToken } })
    if (!inv || !inv.identifier.startsWith("invite:") || inv.expires < new Date()) {
      return NextResponse.json({ error: "Invalid or expired invite" }, { status: 400 })
    }
    const invitedEmail = inv.identifier.slice("invite:".length)
    if (invitedEmail !== email) {
      return NextResponse.json({ error: "Email must match the invitation" }, { status: 400 })
    }
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const hashed = await bcrypt.hash(password, 10)
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "MEMBER",
    },
  })

  if (inviteToken) {
    await prisma.verificationToken.deleteMany({ where: { token: inviteToken } })
  }

  return NextResponse.json({ ok: true })
}
