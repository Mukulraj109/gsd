"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings as SettingsIcon, Zap, Trash2 } from "lucide-react"
import { setAutomationRuleEnabledAction } from "@/lib/actions/settings"
import { createProjectAction, deleteProjectAction } from "@/lib/actions/projects"
import { TEAMS, TEAM_LABELS, type TeamSlug } from "@/lib/constants/teams"

type RuleRow = {
  id: string
  name: string
  trigger: string
  action: string
  enabled: boolean
}

type ProjectRow = {
  id: string
  name: string
  description: string | null
  color: string | null
  team: TeamSlug
}

type Props = {
  automationRules: RuleRow[]
  projects: ProjectRow[]
}

const selectClass =
  "h-11 min-w-[10rem] rounded-md border border-[var(--border)] px-3 text-base disabled:opacity-50"

export function SettingsAdmin({ automationRules, projects }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState("project")
  const [projectName, setProjectName] = useState("")
  const [projectTeam, setProjectTeam] = useState<TeamSlug>("OPS")
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: "project", label: "Project Config", icon: SettingsIcon },
    { id: "automation", label: "Automation", icon: Zap },
  ]

  function toggleRule(id: string, enabled: boolean) {
    startTransition(async () => {
      await setAutomationRuleEnabledAction(id, enabled)
      router.refresh()
    })
  }

  function addProject(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      try {
        await createProjectAction({ name: projectName, team: projectTeam })
        setProjectName("")
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create project")
      }
    })
  }

  function removeProject(id: string) {
    if (!confirm("Delete this project?")) return
    startTransition(async () => {
      try {
        await deleteProjectAction(id)
        router.refresh()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Delete failed")
      }
    })
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--heading)] lg:text-5xl">Settings</h1>
        <p className="text-lg text-[var(--text-muted)]">Project configuration and email automation (Zepto).</p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="w-full shrink-0 space-y-2 lg:w-64">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-12 w-full items-center gap-3 rounded-lg px-4 text-base font-medium transition-colors ${
                activeTab === tab.id ? "bg-[var(--primary)] text-white" : "text-[var(--text-body)] hover:bg-gray-100"
              }`}
            >
              <tab.icon className="h-6 w-6 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-w-0 flex-1 space-y-6">
          {activeTab === "project" && (
            <>
              <Card>
                <CardHeader className="p-6 lg:p-7">
                  <CardTitle className="text-xl">Add project</CardTitle>
                  <CardDescription className="text-base">Assign a team (Dev, Ops, or Core).</CardDescription>
                </CardHeader>
                <CardContent className="px-6 pb-6 lg:px-7 lg:pb-7">
                  <form onSubmit={addProject} className="flex flex-wrap items-end gap-4">
                    {error && <p className="w-full text-base text-[var(--error)]">{error}</p>}
                    <div className="grid min-w-[12rem] flex-1 gap-2">
                      <Label htmlFor="p-name" className="text-base">
                        Name
                      </Label>
                      <Input
                        id="p-name"
                        className="h-11 text-base"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                        disabled={pending}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="p-team" className="text-base">
                        Team
                      </Label>
                      <select
                        id="p-team"
                        className={selectClass}
                        value={projectTeam}
                        onChange={(e) => setProjectTeam(e.target.value as TeamSlug)}
                        disabled={pending}
                      >
                        {TEAMS.map((t) => (
                          <option key={t} value={t}>
                            {TEAM_LABELS[t]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button type="submit" className="h-11 px-5 text-base" disabled={pending}>
                      Add
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="p-6 lg:p-7">
                  <CardTitle className="text-xl">Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 px-6 pb-6 lg:px-7 lg:pb-7">
                  {projects.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-[var(--border)] p-4 lg:p-5"
                    >
                      <div>
                        <p className="text-base font-medium">{p.name}</p>
                        <Badge variant="outline" className="mt-2 text-sm">
                          {TEAM_LABELS[p.team]}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-[var(--error)]"
                        onClick={() => removeProject(p.id)}
                        disabled={pending}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "automation" && (
            <Card>
              <CardHeader className="p-6 lg:p-7">
                <CardTitle className="text-xl">Automation</CardTitle>
                <CardDescription className="text-base">
                  Sends Zepto emails on task assignment and updates when templates are configured.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-6 pb-6 lg:px-7 lg:pb-7">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--border)] p-5"
                  >
                    <div>
                      <p className="text-base font-medium">{rule.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">
                        {rule.trigger} → {rule.action}
                      </p>
                    </div>
                    <label className="flex items-center gap-3 text-base">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={rule.enabled}
                        disabled={pending}
                        onChange={(e) => toggleRule(rule.id, e.target.checked)}
                      />
                      Enabled
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
