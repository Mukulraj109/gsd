"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, UserPlus, MoreVertical, TrendingUp } from "lucide-react"

export type TeamMemberRow = {
  id: string
  name: string | null
  email: string
  role: string
  verified: boolean
  activeTasks: number
}

type Props = { members: TeamMemberRow[]; isAdmin: boolean }

export function TeamDirectoryClient({ members, isAdmin }: Props) {
  const [query, setQuery] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) =>
        m.email.toLowerCase().includes(q) ||
        (m.name?.toLowerCase().includes(q) ?? false) ||
        m.role.toLowerCase().includes(q)
    )
  }, [members, query])

  const topContributors = useMemo(() => {
    return [...members]
      .sort((a, b) => b.activeTasks - a.activeTasks)
      .slice(0, 3)
      .map((m) => ({
        name: m.name ?? m.email,
        initials: (m.name ?? m.email)
          .split(/\s+/)
          .map((p) => p[0])
          .join("")
          .slice(0, 2)
          .toUpperCase(),
        tasks: m.activeTasks,
      }))
  }, [members])

  function resetInviteDialog() {
    setInviteMessage(null)
    setInviteLink(null)
    setInviteError(null)
  }

  async function submitInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    resetInviteDialog()
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim().toLowerCase() }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: string
        signupUrl?: string
        mailConfigured?: boolean
        message?: string
      }
      if (res.status === 409) {
        setInviteError(data.error ?? "That user already exists.")
        return
      }
      if (res.status === 403) {
        setInviteError("You need admin access to send invites.")
        return
      }
      if (!res.ok && !data.signupUrl) {
        setInviteError(typeof data.error === "string" ? data.error : "Invite could not be created.")
        return
      }
      if (typeof data.signupUrl === "string") {
        setInviteLink(data.signupUrl)
      }
      if (res.ok && data.mailConfigured === true) {
        setInviteMessage("Invitation sent.")
        setInviteEmail("")
        return
      }
      if (typeof data.signupUrl === "string") {
        const hint = [data.error, data.message].filter(Boolean).join(" ")
        setInviteMessage(
          hint || "Email was not sent. Copy the signup link and share it securely."
        )
        return
      }
      setInviteError(typeof data.error === "string" ? data.error : "Invite could not be created.")
    } finally {
      setInviteLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Team Directory</h1>
        <p className="text-[var(--text-muted)]">Manage your workspace members and their active workloads.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            placeholder="Search team…"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search team members"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2" type="button" disabled title="Coming soon">
            <TrendingUp className="h-4 w-4" />
            Filter
          </Button>
          {isAdmin ? (
            <Button className="gap-2" type="button" onClick={() => { resetInviteDialog(); setInviteOpen(true) }}>
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          ) : (
            <Button className="gap-2" type="button" disabled title="Admins only">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          )}
        </div>
      </div>

      <Dialog open={inviteOpen} onOpenChange={(o) => { setInviteOpen(o); if (!o) resetInviteDialog() }}>
        <DialogContent>
          <form onSubmit={submitInvite}>
            <DialogHeader>
              <DialogTitle>Invite teammate</DialogTitle>
              <DialogDescription>
                We&apos;ll email them a signup link. If SMTP is not configured, you&apos;ll get a link to copy instead.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="invite-email">Email</Label>
              <Input
                id="invite-email"
                type="email"
                required
                autoComplete="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                disabled={inviteLoading}
              />
            </div>
            {inviteError && <p className="text-sm text-[var(--error)]">{inviteError}</p>}
            {inviteMessage && <p className="text-sm text-[var(--text-muted)]">{inviteMessage}</p>}
            {inviteLink && (
              <div className="space-y-2">
                <Label htmlFor="invite-link">Signup link</Label>
                <Input id="invite-link" readOnly value={inviteLink} className="font-mono text-xs" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void navigator.clipboard.writeText(inviteLink)}
                >
                  Copy link
                </Button>
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                Close
              </Button>
              <Button type="submit" disabled={inviteLoading}>
                {inviteLoading ? "Sending…" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Team Members ({filtered.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">NAME</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">EMAIL ADDRESS</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">ROLE</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">STATUS</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">ACTIVE TASKS</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((member) => {
                      const name = member.name ?? member.email
                      const initials = name
                        .split(/\s+/)
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                      return (
                        <tr key={member.id} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>{initials}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm">{member.email}</td>
                          <td className="py-4">
                            <Badge variant={member.role === "ADMIN" ? "default" : "outline"}>{member.role}</Badge>
                          </td>
                          <td className="py-4">
                            <Badge variant={member.verified ? "success" : "warning"}>
                              {member.verified ? "ACTIVE" : "PENDING"}
                            </Badge>
                          </td>
                          <td className="py-4">{member.activeTasks}</td>
                          <td className="py-4">
                            <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text)]">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Top contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topContributors.map((c) => (
                <div key={c.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{c.initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <span className="text-sm text-[var(--text-muted)]">{c.tasks} tasks</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
