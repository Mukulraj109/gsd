import type { DefaultSession } from "next-auth"
import type { TeamSlug } from "@/lib/constants/teams"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      team: TeamSlug | null
      devTeamAccess: boolean
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
    team?: TeamSlug | null
    devTeamAccess?: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    team?: TeamSlug | null
    devTeamAccess?: boolean
  }
}
