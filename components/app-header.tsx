"use client"

import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Settings, User, LogOut, Bell } from "lucide-react"
import Link from "next/link"

export function AppHeader() {
  return (
    <header className="glossy-header sticky top-0 z-50 border-b">
      <div className="container flex h-20 items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="glossy-button relative hover:scale-105 transition-transform">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-lg animate-pulse"></span>
          </Button>
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="glossy-button relative h-12 w-12 rounded-full hover:scale-105 transition-transform"
              >
                <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-gradient-to-r from-slate-200 to-slate-300 dark:ring-slate-600 shadow-lg">
                  <AvatarImage src="/placeholder.svg" alt="User" />
                  <AvatarFallback className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 font-serif font-semibold">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 glossy-card border-0 shadow-2xl" align="end" forceMount>
              <DropdownMenuLabel className="p-4">
                <div className="flex flex-col space-y-2">
                  <p className="font-serif text-base font-semibold leading-none">John Doe</p>
                  <p className="font-body text-sm leading-none text-muted-foreground">john.doe@example.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
              <DropdownMenuItem
                asChild
                className="glossy-button m-1 rounded-md hover:scale-[1.02] transition-transform"
              >
                <Link href="/profile" className="flex items-center">
                  <User className="mr-3 h-4 w-4" />
                  <span className="font-body">Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                asChild
                className="glossy-button m-1 rounded-md hover:scale-[1.02] transition-transform"
              >
                <Link href="/settings" className="flex items-center">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="font-body">Application Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
              <DropdownMenuItem className="glossy-button m-1 rounded-md hover:scale-[1.02] transition-transform text-red-600 dark:text-red-400">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-body">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
