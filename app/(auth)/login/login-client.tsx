"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, ArrowLeft, Clock, Globe, Sun, Moon, Shield, Mail, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useClientNow } from "@/hooks/use-client-now"
import {
  CLOCK_PLACEHOLDER_SHORT,
  formatZoneClock,
  INDIA_TIME_ZONE,
  US_TIME_ZONE,
} from "@/lib/world-clock"

type Props = { showSeedHints: boolean }

export function LoginClient({ showSeedHints }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const now = useClientNow()

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
        setError("Invalid email or password. Please try again.")
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  const isPM = now ? now.getHours() >= 12 : true
  const indiaDisplay = now
    ? formatZoneClock(now, INDIA_TIME_ZONE, { withSeconds: false })
    : CLOCK_PLACEHOLDER_SHORT
  const usDisplay = now
    ? formatZoneClock(now, US_TIME_ZONE, { withSeconds: false })
    : CLOCK_PLACEHOLDER_SHORT

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[var(--secondary)]/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="absolute left-8 top-8 z-20 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--heading)]"
      >
        <ArrowLeft className="h-5 w-5" />
        Back to Home
      </Link>

      {/* Login form */}
      <div className="relative z-10 flex w-full items-center justify-center px-6">
        <div className="w-full max-w-lg">
          <div className="rounded-3xl border border-[var(--border)]/50 bg-white/90 shadow-2xl backdrop-blur-md">
            <div className="p-10">
              {/* Logo */}
              <div className="mb-8 flex flex-col items-center">
                <Image
                  src="/brand/fst-logo.png"
                  alt="FirstStep"
                  width={220}
                  height={77}
                  className="h-16 w-auto"
                  priority
                />
                <h1 className="mt-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-3xl font-black text-transparent">
                  Get Stuff Done
                </h1>
                <p className="mt-3 text-base text-[var(--text-muted)]">Sign in to your workspace</p>
              </div>

              {/* Time widget */}
              <div className="mb-8 flex items-center justify-center gap-5 rounded-2xl border border-[var(--border)] bg-gradient-to-r from-slate-50 to-white p-4">
                {isPM ? <Moon className="h-5 w-5 text-[var(--primary)]" /> : <Sun className="h-5 w-5 text-[var(--secondary)]" />}
                <div className="h-6 w-px bg-[var(--border)]" />
                <Globe className="h-5 w-5 text-[var(--text-muted)]" />
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--primary)]" />
                    <span className="text-sm font-medium text-[var(--text-muted)]">IN</span>
                    <span
                      className="font-mono text-base font-bold tabular-nums text-[var(--heading)]"
                      suppressHydrationWarning
                    >
                      {indiaDisplay}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-[var(--secondary)]" />
                    <span className="text-sm font-medium text-[var(--text-muted)]">US</span>
                    <span
                      className="font-mono text-base font-bold tabular-nums text-[var(--heading)]"
                      suppressHydrationWarning
                    >
                      {usDisplay}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="rounded-xl border border-[var(--error)]/20 bg-[var(--error)]/5 p-4 text-base text-[var(--error)]">
                    {error}
                  </div>
                )}
                <div className="space-y-3">
                  <label htmlFor="email" className="text-base font-semibold text-[var(--heading)]">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="h-14 text-base"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="password" className="text-base font-semibold text-[var(--heading)]">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="h-14 pr-14 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--text)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="h-14 w-full text-lg font-bold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Info boxes */}
              <div className="mt-8 space-y-4">
                {/* Admin only access */}
                <div className="flex items-start gap-4 rounded-2xl border border-[var(--primary)]/10 bg-gradient-to-r from-[var(--primary)]/5 to-transparent p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10">
                    <Shield className="h-5 w-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--heading)]">Admin-Controlled Access</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Account creation is managed by administrators only. You cannot create an account yourself.
                    </p>
                  </div>
                </div>

                {/* Need access */}
                <div className="flex items-start gap-4 rounded-2xl border border-[var(--secondary)]/10 bg-gradient-to-r from-[var(--secondary)]/5 to-transparent p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--secondary)]/10">
                    <Mail className="h-5 w-5 text-[var(--secondary)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--heading)]">Need an Account?</p>
                    <p className="mt-1 text-sm text-[var(--text-muted)]">
                      Contact your administrator to request access or reset your password.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-base text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} FirstStep. Secure team workspace.
          </p>
        </div>
      </div>
    </div>
  )
}
