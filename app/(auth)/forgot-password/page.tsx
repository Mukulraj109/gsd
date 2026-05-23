"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = (await res.json()) as { message?: string; mailConfigured?: boolean }
      setMsg(data.message ?? "If an account exists, check your email.")
      if (data.mailConfigured === false) {
        setMsg(
          (data.message ?? "") +
            " Configure SMTP_HOST, SMTP_PORT, SMTP_FROM (and SMTP_USER/SMTP_PASSWORD if required) to send mail."
        )
      }
    } catch {
      setErr("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-[var(--heading)]">Forgot password</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Enter your email. We will send a reset link if SMTP is configured and the account exists.
        </p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          {err && <p className="text-sm text-[var(--error)]">{err}</p>}
          {msg && <p className="text-sm text-[var(--success)]">{msg}</p>}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
