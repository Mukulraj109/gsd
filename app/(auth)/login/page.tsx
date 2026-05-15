import { Suspense } from "react"
import { LoginClient } from "./login-client"

export default function LoginPage() {
  const oauthGoogle = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  const oauthGitHub = !!(process.env.GITHUB_ID && process.env.GITHUB_SECRET)

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading…</div>}>
      <LoginClient oauthGoogle={oauthGoogle} oauthGitHub={oauthGitHub} />
    </Suspense>
  )
}
