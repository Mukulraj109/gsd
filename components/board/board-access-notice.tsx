"use client"

import { useEffect, useState } from "react"
import { TEAM_LABELS, type TeamSlug } from "@/lib/constants/teams"
import type { BrowseDeniedReason } from "@/lib/auth/permissions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type Props = {
  accessDenied: boolean
  deniedReason?: BrowseDeniedReason
  memberTeam: TeamSlug | null
}

export function BoardAccessNotice({ accessDenied, deniedReason, memberTeam }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (accessDenied) setOpen(true)
  }, [accessDenied])

  if (!accessDenied) return null

  const message =
    deniedReason === "wrong_team"
      ? "You can only view tasks for your assigned team."
      : memberTeam
        ? `You don't have authority to view ${TEAM_LABELS[memberTeam]} tasks. Ask your lead to enable team board access on your account.`
        : "You don't have authority to view team tasks."

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Access restricted</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
