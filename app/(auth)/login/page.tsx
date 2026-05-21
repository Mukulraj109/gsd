import { Suspense } from "react"
import { showSeedCredentialHints } from "@/lib/dev-hints"
import { LoginClient } from "./login-client"

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginClient showSeedHints={showSeedCredentialHints()} />
    </Suspense>
  )
}
