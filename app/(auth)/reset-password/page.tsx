"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    if (password !== confirm) {
      setErr("Passwords do not match.")
      return
    }
    if (!token) {
      setErr("Missing reset token in URL.")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = (await res.json()) as { error?: string }
      if (!res.ok) {
        setErr(data.error ?? "Reset failed.")
        return
      }
      router.push("/login?reset=1")
    } catch {
      setErr("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return <p className="text-sm text-[var(--error)]">Invalid link. Request a new reset from forgot password.</p>
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {err && <p className="text-sm text-[var(--error)]">{err}</p>}
      <div className="space-y-2">
        <Label htmlFor="pw">New password</Label>
        <Input
          id="pw"
          type="password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pw2">Confirm password</Label>
        <Input
          id="pw2"
          type="password"
          minLength={8}
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Saving…" : "Update password"}
      </Button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-6">
      <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--heading)]">Set new password</h1>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Choose a strong password (at least 8 characters).</p>
        <div className="mt-6">
          <Suspense fallback={<p className="text-sm text-[var(--text-muted)]">Loading…</p>}>
            <ResetForm />
          </Suspense>
        </div>
        <div className="mt-6">
          <Button asChild variant="outline">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
