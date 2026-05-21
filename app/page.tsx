import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { showSeedCredentialHints } from "@/lib/dev-hints"
import { LandingClock } from "@/components/landing/landing-clock"
import { CheckCircle2, Zap, Users, Shield } from "lucide-react"

const features = [
  { icon: CheckCircle2, title: "Task Tracking", desc: "Organize and track all your tasks in one place" },
  { icon: Zap, title: "Real-time Updates", desc: "Stay updated with instant notifications" },
  { icon: Users, title: "Team Collaboration", desc: "Work together seamlessly with your team" },
  { icon: Shield, title: "Secure Access", desc: "Enterprise-grade security for your data" },
]

export default function Home() {
  const showTestCredentials = showSeedCredentialHints()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-teal-50">
      {/* Animated background shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--primary)]/5 blur-3xl" />
        <div className="absolute -right-20 -top-40 h-96 w-96 rounded-full bg-[var(--secondary)]/10 blur-3xl" />
        <div className="absolute -bottom-40 left-1/2 h-80 w-80 rounded-full bg-[var(--primary)]/5 blur-3xl" />
      </div>

      {/* Header with clock */}
      <header className="relative z-10 border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/fst-logo.png"
              alt="FirstStep"
              width={160}
              height={56}
              className="h-10 w-auto"
              priority
            />
            <span className="hidden text-sm font-medium text-[var(--text-muted)] sm:block">| GSD Board</span>
          </div>
          <div className="flex items-center gap-6">
            <LandingClock />
            <Link href="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[var(--primary)]/5 px-4 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--secondary)] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--secondary)]" />
            </span>
            <span className="text-sm font-medium text-[var(--primary)]">FirstStep Team Platform</span>
          </div>

          {/* Main Title */}
          <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight text-[var(--heading)] lg:text-7xl">
            Get <span className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent">Stuff</span> Done
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-[var(--text-muted)] lg:text-2xl">
            Professional task management that helps your team stay organized, collaborate effectively, and ship faster.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-base font-semibold shadow-lg shadow-[var(--primary)]/20">
                Get Started
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>

          {/* Demo credentials hint */}
          {showTestCredentials && (
            <div className="mt-12 rounded-xl border border-[var(--border)] bg-white/80 p-6 shadow-xl backdrop-blur-sm">
              <p className="mb-3 text-sm font-semibold text-[var(--heading)]">Demo Credentials</p>
              <div className="flex flex-col gap-2 text-sm text-[var(--text)]">
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

        {/* Features Grid */}
        <div className="mt-24 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-white shadow-lg shadow-[var(--primary)]/20">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-[var(--heading)]">{feature.title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t border-[var(--border)] pt-8 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            &copy; {new Date().getFullYear()} FirstStep. Built for teams that ship.
          </p>
        </footer>
      </main>
    </div>
  )
}
