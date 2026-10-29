import type React from "react"

interface DashboardHeaderProps {
  heading: string
  description?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, description, children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="grid gap-2">
        <h1 className="gradient-heading font-serif text-4xl font-bold">{heading}</h1>
        {description && (
          <p className="font-body text-lg text-muted-foreground leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
