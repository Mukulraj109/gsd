import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Public registration is disabled. Contact an administrator for access." },
    { status: 403 }
  )
}
