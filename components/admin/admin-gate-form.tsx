"use client"

import { useState, useTransition } from "react"
import { verifyAdminPinAction, enterAdminWithoutPinAction } from "@/lib/actions/admin-gate"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function AdminGateForm({ skipPin }: { skipPin?: boolean }) {
  const [pin, setPin] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await verifyAdminPinAction(skipPin ? (process.env.NEXT_PUBLIC_ADMIN_GATE_PIN ?? "") : pin)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed")
      }
    })
  }

  if (skipPin) {
    return (
      <form action={enterAdminWithoutPinAction} className="mt-6">
        <Button type="submit" className="w-full">
          Continue to admin
        </Button>
      </form>
    )
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      <div className="space-y-2">
        <Label htmlFor="admin-pin">Admin PIN</Label>
        <Input
          id="admin-pin"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          autoComplete="off"
          required
          disabled={pending}
        />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Verifying…" : "Unlock admin panel"}
      </Button>
    </form>
  )
}
