"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Props = { oauthGoogle: boolean; oauthGitHub: boolean; inviteToken: string }

type InviteStatus = "idle" | "pending" | "ok" | "fail"

export function SignupClientGate(props: Omit<Props, "inviteToken">) {
  const searchParams = useSearchParams()
  const inviteToken = searchParams.get("inviteToken")?.trim() || ""
  return <SignupClient key={inviteToken || "__signup__"} {...props} inviteToken={inviteToken} />
}

export function SignupClient({ oauthGoogle, oauthGitHub, inviteToken }: Props) {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [inviteStatus, setInviteStatus] = useState<InviteStatus>(() => (inviteToken ? "pending" : "idle"))
  const [inviteError, setInviteError] = useState<string | null>(null)

  useEffect(() => {
    if (!inviteToken) return
    let cancelled = false
    ;(async () => {
      const res = await fetch(`/api/invite/preview?token=${encodeURIComponent(inviteToken)}`)
      const data = (await res.json().catch(() => ({}))) as { email?: string; error?: string }
      if (cancelled) return
      if (!res.ok) {
        setInviteError(
          res.status === 410 ? "This invitation has expired." : "This invitation link is invalid."
        )
        setInviteStatus("fail")
        return
      }
      if (typeof data.email === "string") {
        setEmail(data.email)
        setInviteError(null)
        setInviteStatus("ok")
      } else {
        setInviteError("Could not read invitation.")
        setInviteStatus("fail")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [inviteToken])

  const oauthBlockedByInvite = inviteStatus === "ok"
  const showDevHints =
    process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_SHOW_TEST_CREDENTIALS === "true"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const emailNorm = email.trim().toLowerCase()
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: emailNorm,
          password,
          ...(inviteStatus === "ok" ? { inviteToken } : {}),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        fields?: Record<string, string[] | undefined>
      }
      if (!res.ok) {
        if (typeof data.error === "string") {
          setError(data.error)
        } else {
          setError("Could not create account. Check your inputs.")
        }
        return
      }
      const sign = await signIn("credentials", {
        email: emailNorm,
        password,
        redirect: false,
      })
      if (sign?.error) {
        setError("Account created but sign-in failed. Try logging in.")
        return
      }
      router.push("/dashboard")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--primary)] text-xl font-bold text-white">
              G
            </div>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Enter your details to get started with GSD</CardDescription>
        </CardHeader>
        <CardContent>
          {inviteStatus === "pending" && (
            <p className="mb-4 text-sm text-[var(--text-muted)]">Checking invitation…</p>
          )}
          {inviteError && (
            <p className="mb-4 text-sm text-[var(--error)]">
              {inviteError} You can still sign up without an invite, or ask your admin for a new link.
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-[var(--error)]">{error}</p>}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                disabled={inviteStatus === "pending"}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                readOnly={inviteStatus === "ok"}
                disabled={inviteStatus === "pending" || inviteStatus === "ok"}
                className={inviteStatus === "ok" ? "bg-gray-50" : undefined}
              />
              {inviteStatus === "ok" && (
                <p className="text-xs text-[var(--text-muted)]">This email is set by your invitation.</p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={inviteStatus === "pending"}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="terms"
                className="h-4 w-4 rounded border-[var(--border)] text-[var(--primary)]"
                required
                disabled={inviteStatus === "pending"}
              />
              <label htmlFor="terms" className="text-sm text-[var(--text)]">
                I agree to the Terms and Privacy Policy (placeholder links).
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={loading || inviteStatus === "pending"}>
              {loading ? "Creating…" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[var(--text-muted)]">Or</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={!oauthGoogle || oauthBlockedByInvite}
                title={
                  oauthBlockedByInvite
                    ? "Use email and password to accept this invite"
                    : oauthGoogle
                      ? "Sign up with Google"
                      : "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
                }
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                Sign up with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={!oauthGitHub || oauthBlockedByInvite}
                title={
                  oauthBlockedByInvite
                    ? "Use email and password to accept this invite"
                    : oauthGitHub
                      ? "Sign up with GitHub"
                      : "Set GITHUB_ID and GITHUB_SECRET"
                }
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              >
                Sign up with GitHub
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-[var(--primary)] hover:underline">
              Sign in
            </Link>
          </p>

          {showDevHints && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--heading)]">Test accounts (dev / when enabled):</p>
              <p className="text-xs text-[var(--text-muted)]">Admin: admin@gsd.com / password123</p>
              <p className="text-xs text-[var(--text-muted)]">Member: member@gsd.com / password123</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
