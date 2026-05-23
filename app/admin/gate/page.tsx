import Link from "next/link"
import Image from "next/image"
import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/auth/permissions"
import { hasValidAdminGate, isAdminPinConfigured } from "@/lib/auth/admin-gate"
import { AdminGateForm } from "@/components/admin/admin-gate-form"

export default async function AdminGatePage() {
  const user = await getSessionUser()
  if (!user) redirect("/login")
  if (await hasValidAdminGate(user.id)) redirect("/admin/team")

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <Image
        src="/brand/fst-logo.png"
        alt="FirstStep"
        width={160}
        height={56}
        className="mb-6 h-10 sm:h-12"
        style={{ width: "auto" }}
      />
      <div className="w-full max-w-md rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-xl font-semibold text-[var(--heading)]">Admin Panel</h1>
        <p className="mt-2 text-sm text-[var(--text)]">
          {isAdminPinConfigured()
            ? "Enter the admin PIN to access Team Directory, Activity, and Settings."
            : "PIN is not configured (ADMIN_GATE_PIN). Continue to admin area."}
        </p>
        <AdminGateForm skipPin={!isAdminPinConfigured()} />
        <Link href="/dashboard" className="mt-4 block text-center text-sm text-[var(--secondary)] hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  )
}
