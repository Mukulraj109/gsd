"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Props = { oauthGoogle: boolean; oauthGitHub: boolean; showSeedHints: boolean }

export function LoginClient({ oauthGoogle, oauthGitHub, showSeedHints }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })
      if (res?.error) {
        setError("Invalid email or password.")
        return
      }
      router.push(callbackUrl)
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
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your GSD account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-[var(--error)]">{error}</p>}
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
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm text-[var(--primary)] hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
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
                disabled={!oauthGoogle}
                title={oauthGoogle ? "Sign in with Google" : "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"}
                onClick={() => signIn("google", { callbackUrl })}
              >
                Continue with Google
              </Button>
              <Button
                variant="outline"
                className="w-full"
                type="button"
                disabled={!oauthGitHub}
                title={oauthGitHub ? "Sign in with GitHub" : "Set GITHUB_ID and GITHUB_SECRET"}
                onClick={() => signIn("github", { callbackUrl })}
              >
                Continue with GitHub
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-[var(--primary)] hover:underline">
              Sign up
            </Link>
          </p>

          {showSeedHints && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--heading)]">Demo accounts (after seed):</p>
              <p className="text-xs text-[var(--text-muted)]">Admin: admin@gsd.com / password123</p>
              <p className="text-xs text-[var(--text-muted)]">Member: member@gsd.com / password123</p>
              <p className="mt-2 text-xs text-[var(--text-muted)]">
                If login fails, your DB may be empty: run <code className="rounded bg-gray-100 px-0.5">npx prisma migrate deploy</code> then{" "}
                <code className="rounded bg-gray-100 px-0.5">npx tsx prisma/seed.ts</code> in the Render shell (same{" "}
                <code className="rounded bg-gray-100 px-0.5">DATABASE_URL</code>).
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
