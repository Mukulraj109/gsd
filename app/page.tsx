import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <main className="flex flex-col items-center gap-8 p-8 max-w-4xl">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold text-[var(--heading)]">
            GSD
          </h1>
          <p className="text-2xl text-[var(--text)]">
            Get Stuff Done
          </p>
          <p className="text-lg text-[var(--text-muted)] max-w-2xl">
            Professional task management for the FirstStep Team.
            Manage tasks, collaborate with your team, and track progress with our Kanban board.
          </p>
        </div>

        <div className="flex gap-4 mt-8">
          <Link href="/board">
            <Button size="lg">
              View Task Board
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white rounded-lg border border-[var(--border)] max-w-md">
          <h3 className="font-semibold text-[var(--heading)] mb-3">Test Credentials</h3>
          <div className="space-y-2 text-sm text-[var(--text)]">
            <div>
              <strong>Admin:</strong> admin@gsd.com / password123
            </div>
            <div>
              <strong>Member:</strong> member@gsd.com / password123
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[var(--primary)]">🎯</div>
            <h4 className="font-semibold mt-2">Kanban Board</h4>
            <p className="text-sm text-[var(--text-muted)]">Drag & drop tasks</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--secondary)]">👥</div>
            <h4 className="font-semibold mt-2">Team Directory</h4>
            <p className="text-sm text-[var(--text-muted)]">Track workload</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-[var(--success)]">⚡</div>
            <h4 className="font-semibold mt-2">Automation</h4>
            <p className="text-sm text-[var(--text-muted)]">Email notifications</p>
          </div>
        </div>
      </main>
    </div>
  );
}
