import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const APP_PREFIXES = ["/dashboard", "/board", "/team", "/activity", "/settings"] as const

function isAppRoute(pathname: string) {
  return APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function isAuthPage(pathname: string) {
  return pathname.startsWith("/login") || pathname.startsWith("/signup")
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    if (isAppRoute(pathname) || isAuthPage(pathname)) {
      return new NextResponse("Missing NEXTAUTH_SECRET", { status: 500 })
    }
    return NextResponse.next()
  }

  const token = await getToken({ req, secret })

  if (isAuthPage(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/forgot-password") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (pathname.startsWith("/reset-password") && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  if (isAppRoute(pathname) && !token) {
    const login = new URL("/login", req.url)
    login.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(login)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/board/:path*",
    "/team/:path*",
    "/activity/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ],
}
