import type React from "react"
import { AppHeader } from "@/components/app-header"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
        <div className="mx-auto grid w-full max-w-7xl gap-6 md:gap-8">{children}</div>
      </main>
    </div>
  )
}
