"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { Eye, EyeOff, ArrowLeft, Clock, Globe, Sun, Moon } from "lucide-react"
import { format, addHours, addMinutes } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Props = { showSeedHints: boolean }

function getIndiaTime(date: Date) {
  return addMinutes(addHours(date, 5), 30)
}

function getUSTime(date: Date) {
  return addHours(date, -10)
}

export function LoginClient({ showSeedHints }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every second
  useState(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  })

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

  const indiaTime = getIndiaTime(currentTime)
  const usTime = getUSTime(currentTime)
  const isPM = currentTime.getHours() >= 12

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
        className="absolute left-6 top-6 z-20 flex items-center gap-2 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--heading)]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Login form */}
      <div className="relative z-10 flex w-full items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-[var(--border)]/50 bg-white/80 shadow-2xl backdrop-blur-md">
            <div className="p-8">
              {/* Logo */}
              <div className="mb-8 flex flex-col items-center">
                <Image
                  src="/brand/fst-logo.png"
                  alt="FirstStep"
                  width={180}
                  height={64}
                  className="h-14 w-auto"
                  priority
                />
                <h1 className="mt-4 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-2xl font-bold text-transparent">
                  Get Stuff Done
                </h1>
                <p className="mt-2 text-sm text-[var(--text-muted)]">Sign in to your workspace</p>
              </div>

              {/* Time widget */}
              <div className="mb-6 flex items-center justify-center gap-4 rounded-xl border border-[var(--border)] bg-gradient-to-r from-slate-50 to-white p-3">
                {isPM ? <Moon className="h-4 w-4 text-[var(--primary)]" /> : <Sun className="h-4 w-4 text-[var(--secondary)]" />}
                <div className="h-5 w-px bg-[var(--border)]" />
                <Globe className="h-4 w-4 text-[var(--text-muted)]" />
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                    <span className="font-mono text-sm font-semibold tabular-nums text-[var(--heading)]">
                      {format(indiaTime, "hh:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[var(--secondary)]" />
                    <span className="font-mono text-sm font-semibold tabular-nums text-[var(--heading)]">
                      {format(usTime, "hh:mm a")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-lg border border-[var(--error)]/20 bg-[var(--error)]/5 p-3 text-sm text-[var(--error)]">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[var(--heading)]">
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
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[var(--heading)]">
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
                      className="h-12 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-[var(--text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--text)]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" className="h-12 w-full text-base font-semibold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
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

              {showSeedHints && (
                <div className="mt-6 rounded-xl border border-[var(--border)] bg-gradient-to-r from-slate-50 to-white p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Demo Credentials</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">Admin</span>
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">admin@gsd.com</code>
                      <span className="text-[var(--text-muted)]">/</span>
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">password123</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[var(--secondary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--secondary)]">Member</span>
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">member@gsd.com</code>
                      <span className="text-[var(--text-muted)]">/</span>
                      <code className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs">password123</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
            Need access? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
