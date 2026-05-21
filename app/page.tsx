import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { LandingClock } from "@/components/landing/landing-clock"
import { CheckCircle2, Zap, Users, Shield, Lock, Mail } from "lucide-react"

const features = [
  { icon: CheckCircle2, title: "Task Tracking", desc: "Organize and track all your tasks in one place" },
  { icon: Zap, title: "Real-time Updates", desc: "Stay updated with instant notifications" },
  { icon: Users, title: "Team Collaboration", desc: "Work together seamlessly with your team" },
  { icon: Shield, title: "Secure Access", desc: "Enterprise-grade security for your data" },
]

export default function Home() {
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
        <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-8 lg:h-28">
          <div className="flex items-center gap-5">
            <Image
              src="/brand/fst-logo.png"
              alt="FirstStep"
              width={280}
              height={98}
              className="h-16 w-auto lg:h-20"
              priority
            />
            <span className="hidden text-xl font-bold text-[var(--text-muted)] sm:block lg:text-2xl">| GSD Board</span>
          </div>
          <div className="flex items-center gap-6">
            <LandingClock />
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-lg font-bold shadow-lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-7xl px-8 py-24 lg:py-40">
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
          <h1 className="max-w-5xl text-5xl font-black leading-tight tracking-tight text-[var(--heading)] lg:text-7xl">
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

        {/* Info Cards Section */}
        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {/* Account Access Card */}
          <div className="rounded-2xl border border-[var(--primary)]/20 bg-gradient-to-br from-[var(--primary)]/5 to-white p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10">
              <Lock className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[var(--heading)]">Secure Account Access</h3>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              Access is by invitation only. Your administrator creates your account and provides your login credentials.
            </p>
            <ul className="space-y-2 text-sm text-[var(--text)]">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                Admin-managed user accounts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                No public registration
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                Secure team-based access
              </li>
            </ul>
          </div>

          {/* Contact Admin Card */}
          <div className="rounded-2xl border border-[var(--secondary)]/20 bg-gradient-to-br from-[var(--secondary)]/5 to-white p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)]/10">
              <Mail className="h-6 w-6 text-[var(--secondary)]" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-[var(--heading)]">Need Access?</h3>
            <p className="mb-4 text-sm text-[var(--text-muted)]">
              Contact your administrator to request an account or if you need help logging in.
            </p>
            <div className="rounded-xl border border-[var(--border)] bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-[var(--text)]">Contact your team administrator for:</p>
              <ul className="space-y-2 text-sm text-[var(--text)]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--secondary)]" />
                  New account creation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--secondary)]" />
                  Password reset assistance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[var(--secondary)]" />
                  Team access requests
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 border-t border-[var(--border)] pt-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-3">
              <Image
                src="/brand/fst-logo.png"
                alt="FirstStep"
                width={160}
                height={56}
                className="h-10 w-auto opacity-50"
              />
            </div>
            <p className="text-base text-[var(--text-muted)]">
              &copy; {new Date().getFullYear()} FirstStep. Built for teams that ship.
            </p>
          </div>
        </footer>
      </main>
    </div>
  )
}
