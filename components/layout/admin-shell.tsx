"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminShellSidebar } from "@/components/layout/admin-shell-sidebar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

type Props = {
  children: React.ReactNode
}

export function AdminShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen overflow-hidden bg-[var(--background)]">
      <aside className="hidden h-screen shrink-0 lg:block">
        <AdminShellSidebar className="h-screen" />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[17.5rem] max-w-[85vw] p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Admin navigation menu</SheetTitle>
          <AdminShellSidebar
            className="h-full w-full border-0"
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--border)] bg-white px-4 lg:hidden">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0"
            aria-label="Open admin menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <span className="truncate text-base font-semibold text-[var(--heading)]">Admin Panel</span>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-10">{children}</main>
      </div>
    </div>
  )
}
