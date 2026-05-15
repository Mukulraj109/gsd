"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Settings as SettingsIcon, Zap, Database } from "lucide-react"
import { setAutomationRuleEnabledAction } from "@/lib/actions/settings"

type UserRow = {
  id: string
  name: string | null
  email: string
  role: string
  emailVerified: Date | null
}

type RuleRow = {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
  config: string | null
}

type ProjectRow = {
  id: string
  name: string
  description: string | null
  color: string | null
}

type Props = {
  users: UserRow[]
  automationRules: RuleRow[]
  projects: ProjectRow[]
  isAdmin: boolean
}

export function SettingsPageClient({ users, automationRules, projects, isAdmin }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("users")

  const tabs = [
    { id: "users", label: "User Management", icon: Users },
    { id: "project", label: "Project Config", icon: SettingsIcon },
    { id: "automation", label: "Automation", icon: Zap },
    { id: "security", label: "Security", icon: Database },
  ]

  function toggleRule(id: string, enabled: boolean) {
    if (!isAdmin) return
    startTransition(async () => {
      await setAutomationRuleEnabledAction(id, enabled)
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Settings</h1>
        <p className="text-[var(--text-muted)]">Manage your workspace settings and preferences.</p>
      </div>

      <div className="flex gap-6">
        <div className="w-64 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--text)] hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          {activeTab === "users" && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Workspace members from the database.</CardDescription>
                  </div>
                  <Button className="gap-2" type="button" disabled>
                    <Users className="h-4 w-4" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-left">
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">MEMBER NAME</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">EMAIL ADDRESS</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">ROLE</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">STATUS</th>
                      <th className="pb-3 text-sm font-medium text-[var(--text-muted)]">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-medium text-white">
                              {(user.name ?? user.email)
                                .split(/\s+/)
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                            <span className="font-medium">{user.name ?? user.email}</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm">{user.email}</td>
                        <td className="py-4">
                          <Badge variant={user.role === "ADMIN" ? "default" : "outline"}>{user.role}</Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant={user.emailVerified ? "success" : "warning"}>
                            {user.emailVerified ? "ACTIVE" : "PENDING"}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <button type="button" className="text-sm text-[var(--primary)] hover:underline">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {activeTab === "project" && (
            <Card>
              <CardHeader>
                <CardTitle>Project Configuration</CardTitle>
                <CardDescription>Projects stored in PostgreSQL.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-3 font-semibold">Projects</h3>
                  <div className="flex flex-wrap gap-2">
                    {projects.length === 0 ? (
                      <p className="text-sm text-[var(--text-muted)]">No projects yet.</p>
                    ) : (
                      projects.map((p) => (
                        <Badge key={p.id} style={p.color ? { borderColor: p.color } : undefined}>
                          {p.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold">Board statuses</h3>
                  <p className="text-sm text-[var(--text-muted)]">
                    To Do, In Progress, Review, Done — aligned with task workflow.
                  </p>
                </div>
                <div>
                  <h3 className="mb-3 font-semibold">Priority levels</h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((label, i) => (
                      <Card key={label} className="p-4 text-center">
                        <div
                          className={
                            i === 0
                              ? "font-bold text-[var(--error)]"
                              : i === 1
                                ? "font-bold text-[var(--warning)]"
                                : i === 2
                                  ? "font-bold text-[var(--secondary)]"
                                  : "font-bold text-gray-500"
                          }
                        >
                          {label}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "automation" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Automation rules</CardTitle>
                  <CardDescription>
                    {isAdmin ? "Toggle rules stored in the database." : "Only admins can change automations."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {automationRules.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)]">No automation rules yet.</p>
                  ) : (
                    automationRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="flex items-start justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-[var(--primary)]" />
                            <h4 className="font-semibold">{rule.name}</h4>
                          </div>
                          <p className="text-sm text-[var(--text-muted)]">
                            {rule.trigger} → {rule.action}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Emails are not sent until SMTP is configured.
                          </p>
                        </div>
                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={rule.enabled}
                            disabled={!isAdmin || pending}
                            onChange={(e) => toggleRule(rule.id, e.target.checked)}
                          />
                          <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[var(--primary)] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300" />
                        </label>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Authentication is handled by NextAuth (credentials).</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">Two-Factor Authentication</h3>
                  <p className="mb-3 text-sm text-[var(--text-muted)]">Not configured in this build.</p>
                  <Button variant="outline" type="button" disabled>
                    Enable 2FA
                  </Button>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Session</h3>
                  <p className="text-sm text-[var(--text-muted)]">JWT sessions via NextAuth.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" disabled>
              Discard Changes
            </Button>
            <Button type="button" disabled>
              Save Global Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
