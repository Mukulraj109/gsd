import nodemailer from "nodemailer"

export function isMailConfigured(): boolean {
  return !!(process.env.SMTP_HOST?.trim() && process.env.SMTP_FROM?.trim())
}

export async function sendMail(opts: { to: string; subject: string; html: string }): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!isMailConfigured()) {
    return { ok: false, reason: "SMTP not configured" }
  }

  const port = Number(process.env.SMTP_PORT || "587")
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true",
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
        : undefined,
  })

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  return { ok: true }
}

export function appBaseUrl(): string {
  return (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "")
}
