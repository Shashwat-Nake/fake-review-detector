"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { authService, type User } from "@/lib/auth"

export function UserHeader() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
  }

  const handleLogout = async () => {
    await authService.logout()
    window.location.reload()
  }

  if (!user) return null

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fake Review Detector</h1>
            <p className="text-sm text-gray-600">Welcome, {user.username}!</p>
          </div>
          <nav className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Analyze
            </Link>
            <Link
              href="/history"
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              History
            </Link>
            <Link href="/stats" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Statistics
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-600"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
