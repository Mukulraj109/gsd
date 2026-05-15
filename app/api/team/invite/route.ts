import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { z } from "zod"
import { randomBytes } from "crypto"
import { addDays } from "date-fns"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendMail, appBaseUrl } from "@/lib/email"
import { rateLimitAllow } from "@/lib/rate-limit"

const bodySchema = z.object({
  email: z.string().email().max(255),
})

export async function POST(req: Request) {
  if (!rateLimitAllow(req, "team-invite", 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 })
  }

  const token = randomBytes(32).toString("hex")
  const identifier = `invite:${email}`
  const expires = addDays(new Date(), 7)

  await prisma.verificationToken.deleteMany({ where: { identifier } })
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  })

  const signupUrl = `${appBaseUrl()}/signup?inviteToken=${encodeURIComponent(token)}`
  let result: Awaited<ReturnType<typeof sendMail>>
  try {
    result = await sendMail({
      to: email,
      subject: "You are invited to GSD",
      html: `<p>You have been invited to join GSD.</p><p><a href="${signupUrl}">Create your account</a></p><p>This link expires in 7 days.</p>`,
    })
  } catch {
    return NextResponse.json(
      { error: "Could not send email. Check SMTP settings.", signupUrl, mailConfigured: false },
      { status: 502 }
    )
  }

  if (!result.ok) {
    return NextResponse.json({
      ok: true,
      mailConfigured: false,
      signupUrl,
      message: result.reason,
    })
  }

  return NextResponse.json({ ok: true, mailConfigured: true })
}
