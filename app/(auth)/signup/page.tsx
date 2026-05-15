import { Suspense } from "react"
import { showSeedCredentialHints } from "@/lib/dev-hints"
import { SignupClientGate } from "./signup-client"

export default function SignupPage() {
  const oauthGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const oauthGitHub = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET)
  const showSeedHints = showSeedCredentialHints()

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <SignupClientGate oauthGoogle={oauthGoogle} oauthGitHub={oauthGitHub} showSeedHints={showSeedHints} />
    </Suspense>
  )
}
