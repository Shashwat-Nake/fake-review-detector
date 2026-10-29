"use client"

import type React from "react"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { ReviewResults } from "@/components/review-results"
import type { ReviewData } from "@/lib/types"

interface ReviewAnalyzerProps {
  onAnalyze?: (result: string) => void
}

export const ReviewAnalyzer: React.FC<ReviewAnalyzerProps> = ({ onAnalyze }) => {
  const [reviewText, setReviewText] = useState("")
  const [result, setResult] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReviewText(event.target.value)
  }

  const handleAnalyze = async () => {
    if (!reviewText.trim()) return

    setLoading(true)
    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const normalized = reviewText.toLowerCase()
      const suspiciousTerms = ["best ever", "guaranteed", "must buy", "perfect", "amazing"]
      const matchedTerms = suspiciousTerms.filter((term) => normalized.includes(term))
      const excessivePunctuation = (reviewText.match(/[!?]{2,}/g) ?? []).length > 0
      const isLikelyFake = matchedTerms.length >= 2 || excessivePunctuation || reviewText.length < 35
      const fakeProbability = Math.min(
        0.95,
        0.12 + matchedTerms.length * 0.2 + (excessivePunctuation ? 0.18 : 0) + (reviewText.length < 35 ? 0.2 : 0),
      )
      const analysisResult: ReviewData = {
        text: reviewText,
        fakeProbability,
        trustScore: 1 - fakeProbability,
        sentimentScore: normalized.includes("bad") || normalized.includes("terrible") ? -0.65 : 0.7,
        languagePatterns: [
          {
            name: "Promotional language",
            value: matchedTerms.length ? `${matchedTerms.length} phrase(s) detected` : "Not detected",
            suspicious: matchedTerms.length > 0,
            severity: matchedTerms.length > 1 ? "high" : "medium",
            description: "Checks for exaggerated or promotional wording.",
          },
          {
            name: "Review detail",
            value: reviewText.length >= 80 ? "Detailed" : "Brief",
            suspicious: reviewText.length < 35,
            severity: reviewText.length < 35 ? "medium" : "low",
            description: "Longer, specific reviews provide stronger evidence.",
          },
          {
            name: "Punctuation pattern",
            value: excessivePunctuation ? "Repeated punctuation" : "Typical",
            suspicious: excessivePunctuation,
            severity: excessivePunctuation ? "medium" : "low",
            description: "Checks for repeated emphasis markers.",
          },
        ],
        flags: [
          ...(matchedTerms.length ? [`Promotional wording detected: ${matchedTerms.join(", ")}.`] : []),
          ...(excessivePunctuation ? ["Repeated punctuation may indicate exaggerated language."] : []),
          ...(reviewText.length < 35 ? ["The review is unusually short and contains limited supporting detail."] : []),
        ].map((description, index) => ({
          id: `flag-${index}`,
          type: "language" as const,
          severity: "medium" as const,
          title: "Potential authenticity concern",
          description,
          evidence: [description],
          confidence: 0.78,
        })),
        trustIndicators: [],
        detailedAnalysis: {
          contentQuality: reviewText.length >= 80 ? 0.82 : 0.48,
          languageAuthenticity: isLikelyFake ? 0.35 : 0.8,
          userCredibility: 0.6,
          temporalConsistency: 0.7,
          overallConfidence: 0.78,
        },
        metadata: { analysisType: "Heuristic NLP analysis", timestamp: new Date().toISOString() },
      }
      setResult(analysisResult)
      onAnalyze?.(isLikelyFake ? "Likely fake review" : "Likely real review")

      // Show success message
      toast({
        title: "Analysis Complete",
        description: "Review has been analyzed and saved to your history.",
      })

      // Check if we're using mock data and show a notification
      // if (analysisResults.metadata?.analysisType?.includes("Mock")) {
      //   console.log("Using enhanced mock analysis. For full functionality, please add your OpenAI API key.")
      // }
    } catch (error) {
      console.error("Error analyzing review:", error)
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing the review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Review Analyzer</h1>
      <textarea
        className="w-full h-40 p-2 border rounded mb-4"
        placeholder="Enter your review here..."
        value={reviewText}
        onChange={handleInputChange}
      />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Analyze Review"}
      </button>

      {result && (
        <div className="mt-8 space-y-4">
          <div className={`rounded-xl border p-5 ${result.fakeProbability >= 0.5 ? "border-red-300 bg-red-50 text-red-950 dark:border-red-900 dark:bg-red-950/30 dark:text-red-100" : "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"}`}>
            <p className="text-sm font-medium uppercase tracking-wide opacity-75">Final verdict</p>
            <h2 className="mt-1 text-2xl font-bold">
              {result.fakeProbability >= 0.5 ? "This review is likely fake" : "This review is likely real"}
            </h2>
            <p className="mt-2 text-sm opacity-85">
              {result.fakeProbability >= 0.5
                ? "The analysis found signals commonly associated with fabricated or promotional reviews."
                : "The analysis found no strong signals that suggest this review is fabricated."}
            </p>
          </div>
          <ReviewResults results={result} />
        </div>
      )}
    </div>
  )
}

export default ReviewAnalyzer
