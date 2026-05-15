import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  })

  if (!record || !record.identifier.startsWith("invite:")) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 })
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.deleteMany({ where: { token } })
    return NextResponse.json({ error: "Expired" }, { status: 410 })
  }

  const email = record.identifier.slice("invite:".length)
  return NextResponse.json({ email })
}
