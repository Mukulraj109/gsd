import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const MEMBER_PREFIXES = ["/dashboard", "/board", "/tasks"] as const
const ADMIN_PREFIXES = ["/admin"] as const
const LEGACY_REDIRECTS: Record<string, string> = {
  "/team": "/admin/gate",
  "/activity": "/admin/gate",
  "/settings": "/admin/gate",
  "/signup": "/login",
  "/forgot-password": "/login",
  "/reset-password": "/login",
}

function matches(prefixes: readonly string[], pathname: string) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function isAuthPage(pathname: string) {
  return pathname.startsWith("/login")
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const legacy = LEGACY_REDIRECTS[pathname]
  if (legacy) {
    return NextResponse.redirect(new URL(legacy, req.url))
  }

  const secret = process.env.NEXTAUTH_SECRET
  const needsAuth =
    matches(MEMBER_PREFIXES, pathname) ||
    matches(ADMIN_PREFIXES, pathname) ||
    isAuthPage(pathname)

  if (!secret && needsAuth) {
    return new NextResponse("Missing NEXTAUTH_SECRET", { status: 500 })
  }

  const token = await getToken({ req, secret: secret! })

  if (isAuthPage(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if ((matches(MEMBER_PREFIXES, pathname) || matches(ADMIN_PREFIXES, pathname)) && !token) {
    const login = new URL("/login", req.url)
    login.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(login)
  }

  if (matches(ADMIN_PREFIXES, pathname) && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/board/:path*",
    "/tasks/:path*",
    "/admin/:path*",
    "/team",
    "/activity",
    "/settings",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
}
