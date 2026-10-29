"use client"

import { ReviewAnalyzer } from "@/components/review-analyzer"
import { ReviewCriteria } from "@/components/review-criteria"
import { DashboardShell } from "@/components/dashboard-shell"
import { DashboardHeader } from "@/components/dashboard-header"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Fake Review Detector"
        description="Advanced AI-powered system to detect potentially fake reviews using machine learning and natural language processing"
      />
      <div className="space-y-8">
        <ReviewAnalyzer />
        <div className="flex justify-center">
          <Link href="/history">
            <Button variant="outline" className="font-body">
              📊 View Review History
            </Button>
          </Link>
        </div>
        <ReviewCriteria />
      </div>
    </DashboardShell>
  )
}
