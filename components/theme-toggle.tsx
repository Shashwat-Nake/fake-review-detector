"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="glossy-button hover:scale-105 transition-transform">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-500" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glossy-card border-0 shadow-2xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="glossy-button m-1 rounded-md hover:scale-[1.02] transition-transform"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span className="font-body">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("deepblue")}
          className="glossy-button m-1 rounded-md hover:scale-[1.02] transition-transform"
        >
          <Moon className="mr-2 h-4 w-4 text-blue-500" />
          <span className="font-body">Deep Blue</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
