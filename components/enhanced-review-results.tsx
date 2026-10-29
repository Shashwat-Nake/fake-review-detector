"use client"

import { useState } from "react"
import type { ReviewData, SuspiciousFlag } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertTriangle, Info, ChevronDown, ChevronUp, Shield, Eye, User, Clock, MessageSquare } from "lucide-react"

interface EnhancedReviewResultsProps {
  results: ReviewData
}

export function EnhancedReviewResults({ results }: EnhancedReviewResultsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedFlag, setSelectedFlag] = useState<string | null>(null)

  const {
    text,
    fakeProbability,
    trustScore,
    sentimentScore,
    languagePatterns,
    flags,
    trustIndicators,
    detailedAnalysis,
    metadata,
  } = results

  const usingMockData = metadata?.analysisType?.includes("Mock")

  const getTrustColor = (score: number) => {
    if (score >= 70) return "from-green-400 to-green-500"
    if (score >= 40) return "from-yellow-400 to-yellow-500"
    return "from-red-400 to-red-500"
  }

  const getTrustIcon = (score: number) => {
    if (score >= 70) return "🟢"
    if (score >= 40) return "🟡"
    return "🔴"
  }

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-700"
      case "low":
        return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
    }
  }

  const getFlagIcon = (type: SuspiciousFlag["type"]) => {
    switch (type) {
      case "language":
        return <MessageSquare className="h-4 w-4" />
      case "behavior":
        return <User className="h-4 w-4" />
      case "content":
        return <Eye className="h-4 w-4" />
      case "temporal":
        return <Clock className="h-4 w-4" />
      case "metadata":
        return <Info className="h-4 w-4" />
    }
  }

  return (
    <TooltipProvider>
      <div className="w-full space-y-6">
        {usingMockData && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4 mb-6 shadow-md">
            <p className="font-body text-base text-blue-800 dark:text-blue-200 leading-relaxed">
              <Info className="inline-block mr-2 h-5 w-5" />
              Using enhanced analysis mode. For AI-powered analysis with even more detailed insights, please add your
              OpenAI API key.
            </p>
          </div>
        )}

        {/* Trust Score Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getTrustIcon(trustScore)}</span>
            <div>
              <h2 className="gradient-heading font-serif text-3xl font-bold">Review Analysis</h2>
              <p className="font-body text-lg text-muted-foreground">
                Trust Score: {trustScore.toFixed(0)}% • {flags.length} suspicious indicators found
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {trustScore >= 70 ? "✅ Likely Authentic" : trustScore >= 40 ? "⚠️ Suspicious" : "❌ Likely Fake"}
            </div>
            <div className="text-sm text-muted-foreground">
              Confidence: {detailedAnalysis.overallConfidence.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Trust Meter */}
        <Card className="glossy-card rounded-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="flex items-center gap-2 font-serif text-xl font-semibold">
              <Shield className="h-5 w-5" />
              Review Trust Meter
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-body text-sm font-medium">Trust Score</span>
                <span className="font-body text-sm font-bold">{trustScore.toFixed(0)}%</span>
              </div>
              <Progress
                value={trustScore}
                className={`h-4 glossy-progress bg-gradient-to-r ${getTrustColor(trustScore)} shadow-lg`}
              />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{detailedAnalysis.contentQuality.toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Content Quality</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    {detailedAnalysis.languageAuthenticity.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Language Auth.</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {detailedAnalysis.userCredibility.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">User Credibility</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {detailedAnalysis.temporalConsistency.toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Temporal Consist.</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suspicious Flags */}
        {flags.length > 0 && (
          <Card className="glossy-card rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle className="flex items-center gap-2 font-serif text-xl font-semibold">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Why This Review May Be Fake ({flags.length} flags)
              </CardTitle>
              <CardDescription>Click on any flag to see detailed explanation and evidence</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-3">
                {flags.map((flag) => (
                  <Tooltip key={flag.id}>
                    <TooltipTrigger asChild>
                      <div
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${getSeverityColor(flag.severity)} ${selectedFlag === flag.id ? "ring-2 ring-blue-500" : ""}`}
                        onClick={() => setSelectedFlag(selectedFlag === flag.id ? null : flag.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getFlagIcon(flag.type)}
                            <div>
                              <div className="font-body font-semibold">{flag.title}</div>
                              <div className="text-sm opacity-80">{flag.description}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-white/50">
                              {flag.confidence.toFixed(0)}% confidence
                            </Badge>
                            <Badge variant="outline" className={getSeverityColor(flag.severity)}>
                              {flag.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        {selectedFlag === flag.id && (
                          <div className="mt-3 pt-3 border-t border-current/20">
                            <div className="font-body text-sm">
                              <strong>Evidence:</strong>
                              <ul className="list-disc list-inside mt-1 space-y-1">
                                {flag.evidence.map((evidence, index) => (
                                  <li key={index}>{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to see detailed evidence</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Trust Indicators */}
        <Card className="glossy-card rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="font-serif text-xl font-semibold">Trust Indicators</CardTitle>
            <CardDescription>Factors that contribute to the authenticity assessment</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {trustIndicators.map((indicator, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body font-medium">{indicator.category}</span>
                    <span className="font-body text-sm font-bold">
                      {indicator.score.toFixed(0)}/{indicator.maxScore}
                    </span>
                  </div>
                  <Progress
                    value={(indicator.score / indicator.maxScore) * 100}
                    className={`h-2 glossy-progress bg-gradient-to-r ${getTrustColor(indicator.score)} shadow-sm`}
                  />
                  <div className="text-xs text-muted-foreground">{indicator.factors.join(" • ")}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis - Collapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <Card className="glossy-card rounded-xl overflow-hidden">
            <CollapsibleTrigger asChild>
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-serif text-xl font-semibold">Detailed Language Analysis</CardTitle>
                  <Button variant="ghost" size="sm">
                    {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    {isExpanded ? "Collapse" : "Expand"}
                  </Button>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-6">
                <div className="grid gap-4">
                  {languagePatterns.map((pattern, index) => (
                    <Tooltip key={index}>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm hover:shadow-md transition-shadow cursor-help">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {pattern.suspicious
                                ? pattern.severity === "high"
                                  ? "🔴"
                                  : pattern.severity === "medium"
                                    ? "🟡"
                                    : "🟠"
                                : "🟢"}
                            </span>
                            <div>
                              <span className="font-body text-base font-medium">{pattern.name}</span>
                              <div className="text-sm text-muted-foreground">{pattern.description}</div>
                            </div>
                          </div>
                          <Badge
                            variant={pattern.suspicious ? "destructive" : "outline"}
                            className={`px-3 py-1 ${
                              pattern.suspicious
                                ? "bg-gradient-to-r from-red-500 to-red-600"
                                : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                            } shadow-sm`}
                          >
                            <span className="font-body text-sm">{pattern.value}</span>
                          </Badge>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{pattern.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Metadata */}
        {metadata && (
          <Card className="glossy-card rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
              <CardTitle className="font-serif text-xl font-semibold">Review Metadata</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(metadata).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex flex-col p-3 border rounded-lg bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm"
                  >
                    <span className="font-body text-sm font-semibold capitalize text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1")}
                    </span>
                    <span className="font-body text-base font-medium">
                      {typeof value === "boolean" ? (value ? "✅ Yes" : "❌ No") : value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  )
}
