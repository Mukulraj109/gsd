"use client"

import { Suspense, useState } from "react"
import { Sidebar, type SidebarProps } from "@/components/layout/Sidebar"
import { AppHeader } from "@/components/layout/app-header"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

type Props = {
  sidebarProps: SidebarProps
  children: React.ReactNode
}

export function AppShell({ sidebarProps, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden h-screen shrink-0 lg:block">
        <Suspense fallback={null}>
          <Sidebar {...sidebarProps} className="h-screen" />
        </Suspense>
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[17.5rem] max-w-[85vw] p-0 sm:max-w-sm">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <Suspense fallback={null}>
            <Sidebar
              {...sidebarProps}
              className="h-full w-full border-0"
              onNavigate={() => setMobileOpen(false)}
            />
          </Suspense>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader pageTitle="Get Stuff Done" onMenuClick={() => setMobileOpen(true)} />
        <main className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--background)] p-3 sm:p-6 lg:p-8 xl:p-10">
          <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">{children}</div>
        </main>
      </div>
    </div>
  )
}
