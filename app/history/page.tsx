"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import { Trash2, Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"

interface HistoryEntry {
  id: number
  text: string
  fake_probability: number
  is_fake: boolean
  trust_score: number
  flags_detected: number
  date: string
  time: string
  timestamp: string
  analysis_details?: {
    word_count: number
    indicators_found: string[]
  }
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await fetch("http://localhost:8000/history")
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error("Error fetching history:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteReview = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/history/${id}`, {
        method: "DELETE",
      })
      setHistory(history.filter((item) => item.id !== id))
    } catch (error) {
      console.error("Error deleting review:", error)
    }
  }

  const clearAllHistory = async () => {
    if (confirm("Are you sure you want to clear all history?")) {
      try {
        await fetch("http://localhost:8000/history", {
          method: "DELETE",
        })
        setHistory([])
      } catch (error) {
        console.error("Error clearing history:", error)
      }
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">Loading history...</div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Review Analysis History"
        description="View all your previously analyzed reviews with timestamps and results"
      />

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">Total Reviews: {history.length}</div>
          <div className="flex gap-2">
            <Link href="/">
              <Button variant="outline">← Back to Analyzer</Button>
            </Link>
            {history.length > 0 && (
              <Button variant="destructive" onClick={clearAllHistory} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No Reviews Analyzed Yet</h3>
                <p className="text-muted-foreground mb-4">Start analyzing reviews to see your history here.</p>
                <Link href="/">
                  <Button>Analyze Your First Review</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {history.map((entry) => (
              <Card key={entry.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {entry.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {entry.time}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReview(entry.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Review Text:</h4>
                      <p className="text-sm bg-muted p-3 rounded-md">{entry.text}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-2">
                        {entry.is_fake ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <div className="text-sm font-medium">
                            {entry.is_fake ? "Likely Fake" : "Likely Authentic"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(entry.fake_probability * 100).toFixed(1)}% fake probability
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Trust Score</div>
                        <div className="text-xs text-muted-foreground">{(entry.trust_score * 100).toFixed(1)}%</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Flags Detected</div>
                        <div className="text-xs text-muted-foreground">{entry.flags_detected} issues found</div>
                      </div>

                      <div>
                        <div className="text-sm font-medium">Word Count</div>
                        <div className="text-xs text-muted-foreground">
                          {entry.analysis_details?.word_count || 0} words
                        </div>
                      </div>
                    </div>

                    {entry.analysis_details?.indicators_found && entry.analysis_details.indicators_found.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Suspicious Indicators:</h5>
                        <div className="flex flex-wrap gap-2">
                          {entry.analysis_details.indicators_found.map((indicator, index) => (
                            <span key={index} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs">
                              {indicator}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
