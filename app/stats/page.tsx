"use client"

import { useEffect, useState } from "react"
import { UserHeader } from "@/components/user-header"
import { authService } from "@/lib/auth"

interface UserStats {
  total_reviews: number
  fake_reviews: number
  authentic_reviews: number
  fake_percentage: number
  avg_fake_probability: number
  daily_stats: Array<{ date: string; count: number }>
}

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuthAndFetchStats()
  }, [])

  const checkAuthAndFetchStats = async () => {
    const user = await authService.getCurrentUser()
    if (user) {
      setIsAuthenticated(true)
      fetchStats()
    } else {
      setIsAuthenticated(false)
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:8000/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please log in to view statistics</h2>
          <a href="/" className="text-blue-500 hover:underline">
            Go to login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Your Analysis Statistics</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">Loading statistics...</div>
            </div>
          ) : !stats ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-500 text-lg">No statistics available</div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-blue-600">{stats.total_reviews}</div>
                  <div className="text-gray-600">Total Reviews Analyzed</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-red-600">{stats.fake_reviews}</div>
                  <div className="text-gray-600">Fake Reviews Detected</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-green-600">{stats.authentic_reviews}</div>
                  <div className="text-gray-600">Authentic Reviews</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="text-2xl font-bold text-purple-600">{stats.fake_percentage.toFixed(1)}%</div>
                  <div className="text-gray-600">Fake Percentage</div>
                </div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Analysis Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Fake Probability:</span>
                      <span className="font-semibold">{(stats.avg_fake_probability * 100).toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${stats.fake_percentage}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Authentic ({stats.authentic_reviews})</span>
                      <span>Fake ({stats.fake_reviews})</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity (Last 7 Days)</h3>
                  {stats.daily_stats.length === 0 ? (
                    <div className="text-gray-500">No recent activity</div>
                  ) : (
                    <div className="space-y-2">
                      {stats.daily_stats.map((day) => (
                        <div key={day.date} className="flex justify-between items-center">
                          <span className="text-sm">{day.date}</span>
                          <span className="font-semibold">{day.count} reviews</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Performance Insights */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold mb-4">Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-800">Detection Rate</div>
                    <div className="text-sm text-blue-600">
                      You've detected {stats.fake_reviews} fake reviews out of {stats.total_reviews} total
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-800">Accuracy Trend</div>
                    <div className="text-sm text-green-600">
                      {stats.fake_percentage < 20
                        ? "Most reviews you analyze appear authentic"
                        : stats.fake_percentage > 50
                          ? "High fake detection rate - be cautious"
                          : "Balanced mix of authentic and fake reviews"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
