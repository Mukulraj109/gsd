"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Settings as SettingsIcon, Zap, Database } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("users")

  const tabs = [
    { id: "users", label: "User Management", icon: Users },
    { id: "project", label: "Project Config", icon: SettingsIcon },
    { id: "automation", label: "Automation", icon: Zap },
    { id: "security", label: "Security", icon: Database },
  ]

  const users = [
    { name: "Erik Kessler", email: "e.kessler@gsd-hub.com", role: "Admin", status: "ACTIVE" },
    { name: "Julianne De Luca", email: "j.deluca@gsd-hub.com", role: "Editor", status: "ACTIVE" },
    { name: "Marcus Sterling", email: "m.sterling@gsd-hub.com", role: "Viewer", status: "PENDING" },
  ]

  const automations = [
    {
      name: "Task Assignment",
      description: "Send email notification when a user is assigned to a task.",
      enabled: true,
    },
    {
      name: "New Comments",
      description: "Notify stakeholders when a new comment is posted on an active task.",
      enabled: false,
    },
    {
      name: "Status Changes",
      description: "Trigger global alert when task priority is escalated to \"Critical\".",
      enabled: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[var(--heading)]">Settings</h1>
        <p className="text-[var(--text-muted)]">Manage your workspace settings and preferences.</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
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

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === "users" && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>User Management</CardTitle>
                      <CardDescription>Control access and manage team roles.</CardDescription>
                    </div>
                    <Button className="gap-2">
                      <Users className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-left">
                        <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">MEMBER NAME</th>
                        <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">EMAIL ADDRESS</th>
                        <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">ROLE</th>
                        <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">STATUS</th>
                        <th className="pb-3 font-medium text-sm text-[var(--text-muted)]">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={index} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium">
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm">{user.email}</td>
                          <td className="py-4">
                            <Badge variant={user.role === "Admin" ? "default" : "outline"}>
                              {user.role}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Badge variant={user.status === "ACTIVE" ? "success" : "warning"}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <button className="text-sm text-[var(--primary)] hover:underline">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "project" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Project Configuration</CardTitle>
                  <CardDescription>Manage projects, categories, and status options.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Marketing</Badge>
                      <Badge>Engineering</Badge>
                      <Badge>HR</Badge>
                      <Badge>Strategic</Badge>
                      <Button variant="outline" size="sm">Add New</Button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Status Options</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-gray-400"></div>
                        <span>Backlog</span>
                        <Button variant="ghost" size="sm">Edit Flow</Button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-[var(--secondary)]"></div>
                        <span>In Progress</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-[var(--success)]"></div>
                        <span>Complete</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Priority Levels</h3>
                    <div className="grid grid-cols-4 gap-4">
                      <Card className="p-4 text-center">
                        <div className="text-[var(--error)] font-bold">CRITICAL</div>
                        <div className="text-sm text-[var(--text-muted)]">Level 0</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-[var(--warning)] font-bold">HIGH</div>
                        <div className="text-sm text-[var(--text-muted)]">Level 1</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-[var(--secondary)] font-bold">MEDIUM</div>
                        <div className="text-sm text-[var(--text-muted)]">Level 2</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-gray-500 font-bold">LOW</div>
                        <div className="text-sm text-[var(--text-muted)]">Level 3</div>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "automation" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Automation Triggers</CardTitle>
                  <CardDescription>Configure automated notifications and actions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {automations.map((automation, index) => (
                    <div key={index} className="flex items-start justify-between border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-[var(--primary)]" />
                          <h4 className="font-semibold">{automation.name}</h4>
                        </div>
                        <p className="text-sm text-[var(--text-muted)]">{automation.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={automation.enabled}
                          className="sr-only peer"
                          readOnly
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary)]"></div>
                      </label>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Email Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      Task Assignment Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Comment Notification Email
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Status Change Alert Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === "security" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage authentication and access control.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                      Add an extra layer of security to your account.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Session Timeout</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                      Automatically log out after period of inactivity.
                    </p>
                    <select className="w-64 h-10 px-3 border border-[var(--border)] rounded-md">
                      <option>30 minutes</option>
                      <option>1 hour</option>
                      <option>4 hours</option>
                      <option>Never</option>
                    </select>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Data Export</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">
                      Download a copy of your workspace data.
                    </p>
                    <Button variant="outline">Request Export</Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button variant="outline">Discard Changes</Button>
            <Button>Save Global Settings</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
