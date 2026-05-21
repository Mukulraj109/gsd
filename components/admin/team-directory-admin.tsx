"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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
import { Search, UserPlus, Trash2, Pencil } from "lucide-react"
import { createUserAction, deleteUserAction, updateUserAction } from "@/lib/actions/users"
import { ADMIN_ALL_TEAMS_LABEL, TEAMS, type TeamSlug } from "@/lib/constants/teams"

/** UI-only value when role is ADMIN (persisted as null team). */
const ALL_TEAMS = "ALL" as const
type TeamField = TeamSlug | typeof ALL_TEAMS

function teamForSubmit(role: "ADMIN" | "MEMBER", team: TeamField): TeamSlug | null {
  return role === "ADMIN" ? null : (team as TeamSlug)
}

function teamLabelForRow(m: AdminMemberRow, teamLabels: Record<TeamSlug, string>) {
  if (m.role === "ADMIN") return ADMIN_ALL_TEAMS_LABEL
  return m.team ? teamLabels[m.team] : "—"
}

export type AdminMemberRow = {
  id: string
  displayId: string
  name: string | null
  email: string
  role: string
  team: TeamSlug | null
  devTeamAccess: boolean
  activeTasks: number
}

type Props = {
  members: AdminMemberRow[]
  teamLabels: Record<TeamSlug, string>
}

export function TeamDirectoryAdmin({ members, teamLabels }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [editMember, setEditMember] = useState<AdminMemberRow | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [team, setTeam] = useState<TeamField>("OPS")
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER")
  const [devAccess, setDevAccess] = useState(false)

  function onRoleChange(next: "ADMIN" | "MEMBER") {
    setRole(next)
    if (next === "ADMIN") {
      setTeam(ALL_TEAMS)
      setDevAccess(true)
    } else if (team === ALL_TEAMS) {
      setTeam("OPS")
    }
  }
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string; id: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

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

  function submitCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        const result = await createUserAction({
          email,
          password,
          name,
          team: teamForSubmit(role, team),
          role,
          devTeamAccess: devAccess,
        })
        setCreatedCreds({ email: result.email, password: result.password, id: result.id })
        setEmail("")
        setPassword("")
        setName("")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not create member")
      }
    })
  }

  function openEdit(m: AdminMemberRow) {
    setEditMember(m)
    setEmail(m.email)
    setName(m.name ?? "")
    setRole(m.role === "ADMIN" ? "ADMIN" : "MEMBER")
    setTeam(m.role === "ADMIN" ? ALL_TEAMS : (m.team ?? "OPS"))
    setDevAccess(m.role === "ADMIN" ? true : m.devTeamAccess)
    setPassword("")
    setError(null)
  }

  function submitEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editMember) return
    setError(null)
    startTransition(async () => {
      try {
        await updateUserAction({
          userId: editMember.id,
          email,
          name,
          team: teamForSubmit(role, team),
          role,
          devTeamAccess: devAccess,
          password: password.trim() || undefined,
        })
        setEditMember(null)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update member")
      }
    })
  }

  function removeMember(id: string) {
    if (!confirm("Delete this member? Their assigned tasks will move to you.")) return
    startTransition(async () => {
      try {
        await deleteUserAction(id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed")
      }
    })
  }

  const selectClass =
    "h-11 w-full rounded-md border border-[var(--border)] px-3 text-base disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-[var(--text-muted)]"

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--heading)] lg:text-5xl">Team Directory</h1>
          <p className="max-w-2xl text-lg text-[var(--text-muted)]">
            Create accounts with email and password. Share credentials securely.
          </p>
        </div>
        <Button
          className="h-11 gap-2 px-5 text-base"
          onClick={() => {
            setCreateOpen(true)
            setCreatedCreds(null)
            setError(null)
            setRole("MEMBER")
            setTeam("OPS")
            setDevAccess(false)
          }}
        >
          <UserPlus className="h-5 w-5" />
          Create member
        </Button>
      </div>

      <Card>
        <CardHeader className="p-6 lg:p-7">
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
            <Input
              placeholder="Search members…"
              className="h-11 pl-12 text-base"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-base">
            <thead>
              <tr className="border-b border-[var(--border)] bg-gray-50 text-left text-[var(--heading)]">
                <th className="px-5 py-4 text-base font-semibold">Member</th>
                <th className="px-5 py-4 text-base font-semibold">ID</th>
                <th className="px-5 py-4 text-base font-semibold">Role</th>
                <th className="px-5 py-4 text-base font-semibold">Team</th>
                <th className="px-5 py-4 text-base font-semibold">Team board</th>
                <th className="px-5 py-4 text-base font-semibold">Active tasks</th>
                <th className="px-5 py-4 text-base font-semibold" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-[var(--border)]">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="text-base">
                          {(m.name ?? m.email).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-base font-medium text-[var(--text-body)]">{m.name ?? "—"}</p>
                        <p className="text-sm text-[var(--text-muted)]">{m.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-mono text-sm">{m.displayId}</td>
                  <td className="px-5 py-4">
                    <Badge className="px-2.5 py-0.5 text-sm" variant={m.role === "ADMIN" ? "default" : "outline"}>
                      {m.role}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">{teamLabelForRow(m, teamLabels)}</td>
                  <td className="px-5 py-4">
                    {m.role === "ADMIN" ? "All" : m.devTeamAccess ? "Yes" : "No"}
                  </td>
                  <td className="px-5 py-4 tabular-nums">{m.activeTasks}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10"
                        title="Edit member"
                        disabled={pending}
                        onClick={() => openEdit(m)}
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-[var(--error)]"
                        title="Delete member"
                        disabled={pending}
                        onClick={() => removeMember(m.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={submitEdit}>
            <DialogHeader>
              <DialogTitle>Edit member</DialogTitle>
              <DialogDescription>
                Update profile, team, and role. Leave password blank to keep the current password.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              {error && <p className="text-base text-[var(--error)]">{error}</p>}
              <div className="grid gap-2">
                <Label htmlFor="e-name">Name (optional)</Label>
                <Input
                  id="e-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-email">Email</Label>
                <Input
                  id="e-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-pass">New password (optional)</Label>
                <Input
                  id="e-pass"
                  type="password"
                  minLength={8}
                  placeholder="Leave blank to keep current"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={pending}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-role">Role</Label>
                <select
                  id="e-role"
                  className={selectClass}
                  value={role}
                  onChange={(e) => onRoleChange(e.target.value as "ADMIN" | "MEMBER")}
                  disabled={pending}
                >
                  <option value="MEMBER">MEMBER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-team">Team</Label>
                <select
                  id="e-team"
                  className={selectClass}
                  value={team}
                  onChange={(e) => setTeam(e.target.value as TeamField)}
                  disabled={pending || role === "ADMIN"}
                >
                  {role === "ADMIN" ? (
                    <option value={ALL_TEAMS}>{ADMIN_ALL_TEAMS_LABEL}</option>
                  ) : (
                    TEAMS.map((t) => (
                      <option key={t} value={t}>
                        {teamLabels[t]}
                      </option>
                    ))
                  )}
                </select>
                {role === "ADMIN" && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Admins can view and manage tasks across every team.
                  </p>
                )}
              </div>
              <label className="flex items-center gap-3 text-base">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={devAccess}
                  onChange={(e) => setDevAccess(e.target.checked)}
                  disabled={pending || role === "ADMIN"}
                />
                Can view team board tasks
              </label>
            </div>
            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-5 text-base"
                onClick={() => setEditMember(null)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11 px-5 text-base" disabled={pending}>
                {pending ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          {createdCreds ? (
            <>
              <DialogHeader>
                <DialogTitle>Member created</DialogTitle>
                <DialogDescription>Share these credentials once. They cannot be recovered from this screen.</DialogDescription>
              </DialogHeader>
              <div className="space-y-2 rounded-lg bg-gray-50 p-5 text-base">
                <p><span className="font-medium">Email:</span> {createdCreds.email}</p>
                <p><span className="font-medium">Password:</span> {createdCreds.password}</p>
                <p><span className="font-medium">User ID:</span> {createdCreds.id}</p>
              </div>
              <DialogFooter>
                <Button type="button" onClick={() => setCreateOpen(false)}>Done</Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={submitCreate}>
              <DialogHeader>
                <DialogTitle>Create member</DialogTitle>
                <DialogDescription>User logs in with this email and password only.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                {error && <p className="text-sm text-[var(--error)]">{error}</p>}
                <div className="grid gap-2">
                  <Label htmlFor="m-name">Name (optional)</Label>
                  <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} disabled={pending} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-email">Email</Label>
                  <Input id="m-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={pending} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-pass">Password</Label>
                  <Input id="m-pass" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} disabled={pending} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-role">Role</Label>
                  <select
                    id="m-role"
                    className={selectClass}
                    value={role}
                    onChange={(e) => onRoleChange(e.target.value as "ADMIN" | "MEMBER")}
                    disabled={pending}
                  >
                    <option value="MEMBER">MEMBER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="m-team">Team</Label>
                  <select
                    id="m-team"
                    className={selectClass}
                    value={team}
                    onChange={(e) => setTeam(e.target.value as TeamField)}
                    disabled={pending || role === "ADMIN"}
                  >
                    {role === "ADMIN" ? (
                      <option value={ALL_TEAMS}>{ADMIN_ALL_TEAMS_LABEL}</option>
                    ) : (
                      TEAMS.map((t) => (
                        <option key={t} value={t}>
                          {teamLabels[t]}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <label className="flex items-center gap-3 text-base">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={devAccess}
                    onChange={(e) => setDevAccess(e.target.checked)}
                    disabled={pending || role === "ADMIN"}
                  />
                  Can view team board tasks
                </label>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="outline" className="h-11 px-5 text-base" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="h-11 px-5 text-base" disabled={pending}>
                  {pending ? "Creating…" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
