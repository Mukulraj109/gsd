import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { showSeedCredentialHints } from "@/lib/dev-hints"

export default function Home() {
  const showTestCredentials = showSeedCredentialHints()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)]">
      <main className="flex max-w-4xl flex-col items-center gap-8 p-8">
        <Image
          src="/brand/fst-logo.png"
          alt="FirstStep"
          width={200}
          height={72}
          className="h-16"
          style={{ width: "auto" }}
          priority
        />
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold text-[var(--heading)]">GSD Board</h1>
          <p className="text-xl text-[var(--text)]">Get Stuff Done</p>
          <p className="max-w-2xl text-lg text-[var(--text-muted)]">
            Professional task management for the FirstStep Team. Access is provided by your administrator.
          </p>
        </div>

        <Link href="/login">
          <Button size="lg">Sign In</Button>
        </Link>

        {showTestCredentials && (
          <div className="mt-8 max-w-md rounded-lg border border-[var(--border)] bg-white p-6">
            <h3 className="mb-3 font-semibold text-[var(--heading)]">Demo logins (after seed)</h3>
            <div className="space-y-2 text-sm text-[var(--text)]">
              <div>
                <strong>Admin:</strong> admin@gsd.com / password123
              </div>
              <div>
                <strong>Member:</strong> member@gsd.com / password123
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
