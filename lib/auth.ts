import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { TeamSlug } from "@/lib/constants/teams"

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        return null
      }

      const email = credentials.email.trim().toLowerCase()

      const user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user || !user.password) {
        return null
      }

      const passwordMatch = await bcrypt.compare(credentials.password, user.password)

      if (!passwordMatch) {
        return null
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        team: user.team,
        devTeamAccess: user.devTeamAccess,
      }
    },
  }),
]

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role ?? "MEMBER"
        token.team = user.team ?? null
        token.devTeamAccess = user.devTeamAccess ?? false
      } else if (trigger === "update" && token.sub) {
        // Only refresh from DB when session.update() is called — not on every page load.
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            select: { role: true, team: true, devTeamAccess: true },
          })
          if (dbUser) {
            token.role = dbUser.role
            token.team = dbUser.team
            token.devTeamAccess = dbUser.devTeamAccess
          }
        } catch {
          // Keep existing JWT claims if DB is unreachable (e.g. Render free tier waking up).
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!
        session.user.role = (token.role as string | undefined) ?? "MEMBER"
        session.user.team = (token.team as TeamSlug | null) ?? null
        session.user.devTeamAccess = Boolean(token.devTeamAccess)
      }
      return session
    },
  },
}
