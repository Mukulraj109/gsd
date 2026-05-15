import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  const showTestCredentials =
    process.env.NODE_ENV !== "production" || process.env.SHOW_TEST_CREDENTIALS === "true"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <main className="flex max-w-4xl flex-col items-center gap-8 p-8">
        <div className="space-y-4 text-center">
          <h1 className="text-6xl font-bold text-[var(--heading)]">GSD</h1>
          <p className="text-2xl text-[var(--text)]">Get Stuff Done</p>
          <p className="max-w-2xl text-lg text-[var(--text-muted)]">
            Professional task management for the FirstStep Team. Manage tasks, collaborate with your team, and track
            progress with our Kanban board.
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/login">
            <Button size="lg">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button variant="outline" size="lg">
              Create account
            </Button>
          </Link>
        </div>

        {showTestCredentials && (
          <div className="mt-12 max-w-md rounded-lg border border-[var(--border)] bg-white p-6">
            <h3 className="mb-3 font-semibold text-[var(--heading)]">Test credentials (non-production)</h3>
            <div className="space-y-2 text-sm text-[var(--text)]">
              <div>
                <strong>Admin:</strong> admin@gsd.com / password123
              </div>
              <div>
                <strong>Member:</strong> member@gsd.com / password123
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Hidden in production unless <code className="rounded bg-gray-100 px-1">SHOW_TEST_CREDENTIALS=true</code>{" "}
              is set on the server.
            </p>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
          <div>
            <div className="text-3xl font-bold text-[var(--primary)]">🎯</div>
            <h4 className="mt-2 font-semibold">Kanban Board</h4>
            <p className="text-sm text-[var(--text-muted)]">Tasks backed by PostgreSQL</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--secondary)]">👥</div>
            <h4 className="mt-2 font-semibold">Team Directory</h4>
            <p className="text-sm text-[var(--text-muted)]">Track workload</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--success)]">⚡</div>
            <h4 className="mt-2 font-semibold">Automation</h4>
            <p className="text-sm text-[var(--text-muted)]">Rules & notifications</p>
          </div>
        </div>
      </main>
    </div>
  )
}
