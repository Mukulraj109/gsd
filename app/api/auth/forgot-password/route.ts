import { NextResponse } from "next/server"
import { z } from "zod"
import { randomBytes } from "crypto"
import { addHours } from "date-fns"
import { prisma } from "@/lib/prisma"
import { sendMail, appBaseUrl, isMailConfigured } from "@/lib/email"
import { rateLimitAllow } from "@/lib/rate-limit"

const bodySchema = z.object({
  email: z.string().email().max(255),
})

export async function POST(req: Request) {
  if (!rateLimitAllow(req, "forgot-password", 5, 15 * 60 * 1000)) {
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
    return NextResponse.json({ error: "Invalid email" }, { status: 400 })
  }

  const email = parsed.data.email.trim().toLowerCase()
  const user = await prisma.user.findUnique({ where: { email } })

  // Always same response to avoid email enumeration
  const generic = NextResponse.json({
    ok: true,
    message: "If an account exists for that email, you will receive reset instructions.",
    mailConfigured: isMailConfigured(),
  })

  if (!user || !user.password) {
    return generic
  }

  const token = randomBytes(32).toString("hex")
  const identifier = `reset:${email}`
  const expires = addHours(new Date(), 1)

  await prisma.verificationToken.deleteMany({ where: { identifier } })
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  })

  const url = `${appBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`
  const result = await sendMail({
    to: email,
    subject: "Reset your GSD password",
    html: `<p>Click to reset your password (valid 1 hour):</p><p><a href="${url}">${url}</a></p>`,
  })

  if (!result.ok) {
    await prisma.verificationToken.deleteMany({ where: { identifier } })
    return NextResponse.json(
      {
        ok: true,
        message:
          "Password reset is not fully configured (SMTP missing). Add SMTP_* env vars on the server.",
        mailConfigured: false,
      },
      { status: 200 }
    )
  }

  return generic
}
