"use client"

import type { ReviewData } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"

interface ReviewResultsProps {
  results: ReviewData
}

export function ReviewResults({ results }: ReviewResultsProps) {
  const { text, fakeProbability, sentimentScore, languagePatterns, metadata, flags } = results

  const usingMockData = metadata?.analysisType?.includes("Mock")

  const getFakeProbabilityColor = (probability: number) => {
    if (probability < 0.3) return "from-green-400 to-green-500"
    if (probability < 0.7) return "from-yellow-400 to-yellow-500"
    return "from-red-400 to-red-500"
  }

  const getSentimentColor = (score: number) => {
    if (score < -0.3) return "from-red-400 to-red-500"
    if (score > 0.3) return "from-green-400 to-green-500"
    return "from-yellow-400 to-yellow-500"
  }

  return (
    <div className="w-full space-y-6">
      {usingMockData && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-4 mb-6 shadow-md">
          <p className="font-body text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
            <Info className="inline-block mr-2 h-5 w-5" />
            Using simplified analysis mode. For comprehensive AI-powered analysis, please add your OpenAI API key in the
            project settings.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <h2 className="gradient-heading font-serif text-3xl font-bold">Analysis Results</h2>
        {fakeProbability > 0.7 ? (
          <Badge variant="destructive" className="ml-2 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 shadow-md">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span className="font-body text-sm">Likely Fake</span>
          </Badge>
        ) : fakeProbability > 0.3 ? (
          <Badge
            variant="outline"
            className="ml-2 bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700 px-3 py-1 shadow-md"
          >
            <Info className="mr-2 h-4 w-4" />
            <span className="font-body text-sm">Suspicious</span>
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="ml-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border-green-300 dark:border-green-700 px-3 py-1 shadow-md"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            <span className="font-body text-sm">Likely Authentic</span>
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glossy-card rounded-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="font-serif text-xl font-semibold">Fake Probability</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Progress
                value={fakeProbability * 100}
                className={`h-3 glossy-progress bg-gradient-to-r ${getFakeProbabilityColor(fakeProbability)} shadow-lg`}
              />
              <div className="font-body text-sm text-muted-foreground">
                {(fakeProbability * 100).toFixed(1)}% probability of being fake
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glossy-card rounded-xl overflow-hidden">
          <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="font-serif text-xl font-semibold">Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Progress
                value={(sentimentScore + 1) * 50}
                className={`h-3 glossy-progress bg-gradient-to-r ${getSentimentColor(sentimentScore)} shadow-lg`}
              />
              <div className="font-body text-sm text-muted-foreground">
                Score: {sentimentScore.toFixed(2)} (
                {sentimentScore < -0.3 ? "Negative" : sentimentScore > 0.3 ? "Positive" : "Neutral"})
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glossy-card rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
          <CardTitle className="font-serif text-xl font-semibold">Language Pattern Analysis</CardTitle>
          <CardDescription className="font-body text-base leading-relaxed">
            Key patterns detected in the review text
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid gap-3">
            {languagePatterns.map((pattern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="font-body text-base font-medium">{pattern.name}</span>
                <Badge
                  variant={pattern.suspicious ? "destructive" : "outline"}
                  className={`px-3 py-1 ${
                    pattern.suspicious
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : "bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800"
                  } shadow-sm`}
                >
                  <span className="font-body text-sm">{pattern.value}</span>
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {flags.length > 0 && (
        <Card className="glossy-card rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="font-serif text-xl font-semibold">Suspicious Flags</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="list-disc pl-6 space-y-2">
              {flags.map((flag) => (
                <li key={flag.id} className="font-body text-base text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{flag.title}:</span> {flag.description}
                  {flag.evidence.length > 0 && (
                    <ul className="mt-1 list-[circle] space-y-1 pl-5 text-sm">
                      {flag.evidence.map((evidence, evidenceIndex) => (
                        <li key={`${flag.id}-evidence-${evidenceIndex}`}>{evidence}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {metadata && (
        <Card className="glossy-card rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
            <CardTitle className="font-serif text-xl font-semibold">Metadata Analysis</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(metadata).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between p-3 border rounded-lg bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-sm"
                >
                  <span className="font-body text-base font-semibold capitalize">
                    {key.replace(/([A-Z])/g, " $1")}:
                  </span>
                  <span className="font-body text-base text-muted-foreground">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
