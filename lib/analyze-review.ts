"use server"

import type { LanguagePattern, ReviewData, SuspiciousFlag, TrustIndicator } from "./types"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { LoadAPIKeyError } from "ai"

// Enhanced mock analysis function with detailed point-wise feedback
function generateDetailedMockAnalysis(text: string): ReviewData {
  // Enhanced keyword analysis
  const positiveWords = ["great", "amazing", "excellent", "good", "love", "perfect", "best", "wonderful", "fantastic"]
  const negativeWords = ["bad", "terrible", "worst", "hate", "poor", "awful", "disappointed", "horrible", "useless"]
  const exaggerationWords = [
    "absolutely",
    "incredibly",
    "extremely",
    "totally",
    "completely",
    "unbelievable",
    "perfect",
  ]
  const genericPhrases = [
    "highly recommend",
    "must buy",
    "don't waste your money",
    "best product ever",
    "life changing",
  ]
  const specificDetails = ["battery", "screen", "camera", "size", "weight", "color", "material", "price", "shipping"]

  const lowercaseText = text.toLowerCase()
  const words = text.split(/\s+/)
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  // Count occurrences
  const positiveCount = positiveWords.filter((word) => lowercaseText.includes(word)).length
  const negativeCount = negativeWords.filter((word) => lowercaseText.includes(word)).length
  const exaggerationCount = exaggerationWords.filter((word) => lowercaseText.includes(word)).length
  const genericCount = genericPhrases.filter((phrase) => lowercaseText.includes(phrase)).length
  const specificCount = specificDetails.filter((detail) => lowercaseText.includes(detail)).length

  // Calculate sentiment score (-1 to 1)
  const sentimentScore = Math.max(Math.min((positiveCount - negativeCount) / 5, 1), -1)

  // Count various indicators
  const exclamationCount = (text.match(/!/g) || []).length
  const capsWords = words.filter((word) => word.length > 3 && word === word.toUpperCase()).length
  const shortSentences = sentences.filter((s) => s.trim().split(/\s+/).length < 5).length
  const longSentences = sentences.filter((s) => s.trim().split(/\s+/).length > 20).length

  // Generate detailed suspicious flags
  const flags: SuspiciousFlag[] = []

  if (exclamationCount > 2) {
    flags.push({
      id: "excessive-exclamation",
      type: "language",
      severity: exclamationCount > 4 ? "high" : "medium",
      title: "Excessive Exclamation Marks",
      description: "Overuse of exclamation marks often indicates artificial enthusiasm",
      evidence: [`Found ${exclamationCount} exclamation marks in the review`],
      confidence: Math.min(exclamationCount * 15, 85),
    })
  }

  if (capsWords > 0) {
    flags.push({
      id: "caps-emphasis",
      type: "language",
      severity: capsWords > 2 ? "high" : "medium",
      title: "ALL CAPS for Emphasis",
      description: "Excessive use of capital letters suggests emotional manipulation",
      evidence: [`${capsWords} words written in ALL CAPS`],
      confidence: Math.min(capsWords * 20, 80),
    })
  }

  if (exaggerationCount > 1) {
    flags.push({
      id: "excessive-superlatives",
      type: "content",
      severity: exaggerationCount > 3 ? "high" : "medium",
      title: "Excessive Superlatives",
      description: "Overuse of extreme adjectives without supporting details",
      evidence: [
        `Found ${exaggerationCount} superlative words: ${exaggerationWords.filter((w) => lowercaseText.includes(w)).join(", ")}`,
      ],
      confidence: Math.min(exaggerationCount * 18, 90),
    })
  }

  if (genericCount > 0) {
    flags.push({
      id: "generic-phrases",
      type: "content",
      severity: genericCount > 1 ? "high" : "medium",
      title: "Generic Marketing Phrases",
      description: "Use of common promotional language without specific details",
      evidence: [`Generic phrases detected: ${genericPhrases.filter((p) => lowercaseText.includes(p)).join(", ")}`],
      confidence: Math.min(genericCount * 25, 85),
    })
  }

  if (specificCount === 0 && text.length > 50) {
    flags.push({
      id: "lack-specifics",
      type: "content",
      severity: "high",
      title: "Lack of Specific Details",
      description: "No mention of specific product features or personal experience",
      evidence: ["Review contains no specific product details or personal usage examples"],
      confidence: 75,
    })
  }

  if (text.length < 50) {
    flags.push({
      id: "too-short",
      type: "content",
      severity: "medium",
      title: "Unusually Short Review",
      description: "Very brief reviews often lack authentic personal experience",
      evidence: [`Review is only ${text.length} characters long`],
      confidence: 60,
    })
  }

  if (Math.abs(sentimentScore) > 0.8) {
    flags.push({
      id: "extreme-sentiment",
      type: "language",
      severity: "medium",
      title: "Extreme Sentiment",
      description: "Overly positive or negative sentiment without balanced perspective",
      evidence: [
        `Sentiment score: ${sentimentScore.toFixed(2)} (${sentimentScore > 0 ? "extremely positive" : "extremely negative"})`,
      ],
      confidence: Math.abs(sentimentScore) * 70,
    })
  }

  // Calculate fake probability based on flags
  let fakeProbability = 0.1 // Base probability
  flags.forEach((flag) => {
    const weight = flag.severity === "high" ? 0.15 : flag.severity === "medium" ? 0.1 : 0.05
    fakeProbability += weight * (flag.confidence / 100)
  })
  fakeProbability = Math.min(fakeProbability, 0.95)

  // Calculate trust score (inverse of fake probability)
  const trustScore = Math.max(0, 100 - fakeProbability * 100)

  // Generate detailed analysis scores
  const detailedAnalysis = {
    contentQuality: Math.max(0, 100 - genericCount * 20 - (specificCount === 0 ? 30 : 0)),
    languageAuthenticity: Math.max(0, 100 - exclamationCount * 10 - capsWords * 15 - exaggerationCount * 12),
    userCredibility: Math.random() * 40 + 60, // Mock user credibility
    temporalConsistency: Math.random() * 30 + 70, // Mock temporal analysis
    overallConfidence: Math.max(0, 100 - flags.length * 15),
  }

  // Generate trust indicators
  const trustIndicators: TrustIndicator[] = [
    {
      category: "Content Quality",
      score: detailedAnalysis.contentQuality,
      maxScore: 100,
      factors: specificCount > 0 ? ["Contains specific details"] : ["Lacks specific details"],
    },
    {
      category: "Language Authenticity",
      score: detailedAnalysis.languageAuthenticity,
      maxScore: 100,
      factors: exclamationCount <= 2 ? ["Natural language use"] : ["Artificial enthusiasm detected"],
    },
    {
      category: "User Credibility",
      score: detailedAnalysis.userCredibility,
      maxScore: 100,
      factors: ["Account age unknown", "Purchase verification needed"],
    },
  ]

  // Generate enhanced language patterns
  const languagePatterns: LanguagePattern[] = [
    {
      name: "Exclamation marks",
      value: exclamationCount,
      suspicious: exclamationCount > 2,
      severity: exclamationCount > 4 ? "high" : exclamationCount > 2 ? "medium" : "low",
      description: exclamationCount > 2 ? "Excessive enthusiasm may indicate fake review" : "Normal punctuation usage",
    },
    {
      name: "ALL CAPS words",
      value: capsWords,
      suspicious: capsWords > 0,
      severity: capsWords > 2 ? "high" : capsWords > 0 ? "medium" : "low",
      description: capsWords > 0 ? "Capital letters used for emphasis" : "No excessive capitalization",
    },
    {
      name: "Superlative words",
      value: exaggerationCount,
      suspicious: exaggerationCount > 1,
      severity: exaggerationCount > 3 ? "high" : exaggerationCount > 1 ? "medium" : "low",
      description: exaggerationCount > 1 ? "Overuse of extreme adjectives" : "Balanced language use",
    },
    {
      name: "Specific details",
      value: specificCount,
      suspicious: specificCount === 0,
      severity: specificCount === 0 ? "high" : "low",
      description: specificCount > 0 ? "Contains product-specific information" : "Lacks specific product details",
    },
    {
      name: "Text length",
      value: `${text.length} chars`,
      suspicious: text.length < 50,
      severity: text.length < 30 ? "high" : text.length < 50 ? "medium" : "low",
      description: text.length < 50 ? "Very short review may lack authenticity" : "Adequate review length",
    },
  ]

  return {
    text,
    fakeProbability,
    trustScore,
    sentimentScore,
    languagePatterns,
    flags,
    trustIndicators,
    detailedAnalysis,
    metadata: {
      analysisType: "Enhanced Mock Analysis (OpenAI API key not available)",
      timestamp: new Date().toISOString(),
      verifiedPurchase: Math.random() > 0.3,
      accountAge: `${Math.floor(Math.random() * 36) + 1} months`,
      reviewCount: Math.floor(Math.random() * 50) + 1,
    },
  }
}

export async function analyzeReview(text: string): Promise<ReviewData> {
  try {
    // Check if we have an OpenAI API key before making the API call
    try {
      // Try to use the OpenAI API
      const analysisPrompt = `
        Analyze the following review for signs that it might be fake or fraudulent.
        Provide detailed point-wise analysis including specific flags, trust indicators, and confidence scores.
        
        Review: "${text}"
        
        Respond with a JSON object containing:
        1. fakeProbability: A number between 0 and 1
        2. trustScore: A number between 0 and 100
        3. sentimentScore: A number between -1 and 1
        4. languagePatterns: Array with name, value, suspicious, severity, description
        5. flags: Array of detailed suspicious flags with id, type, severity, title, description, evidence, confidence
        6. trustIndicators: Array with category, score, maxScore, factors
        7. detailedAnalysis: Object with contentQuality, languageAuthenticity, userCredibility, temporalConsistency, overallConfidence
        8. metadata: Any metadata you can infer
      `

      const { text: analysisResult } = await generateText({
        model: openai("gpt-4o"),
        prompt: analysisPrompt,
        temperature: 0.1,
      })

      // Parse the JSON response
      const analysis = JSON.parse(analysisResult)

      // Combine with the original text
      return {
        text,
        ...analysis,
      }
    } catch (error) {
      // Check if the error is due to missing API key
      if (error instanceof LoadAPIKeyError || (error instanceof Error && error.message.includes("API key"))) {
        console.log("OpenAI API key not available, using enhanced mock analysis instead")
        return generateDetailedMockAnalysis(text)
      }

      // Re-throw other errors
      throw error
    }
  } catch (error) {
    console.error("Error analyzing review:", error)

    // Return a fallback analysis using the enhanced mock function
    return generateDetailedMockAnalysis(text)
  }
}

export async function analyzeBatchReviews(file: File): Promise<ReviewData[]> {
  // In a real application, you would parse the file and analyze each review
  // For demo purposes, we'll return enhanced mock data

  // Simulate processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  const sampleReviews = [
    "This product is absolutely amazing! I can't believe how perfect it is. Everyone needs to buy this right now!!!",
    "I've been using this product for about 3 months now. The battery life is excellent, lasting about 8-10 hours with heavy use. The camera quality is good in daylight but struggles in low light conditions. Overall satisfied with my purchase.",
    "Worst purchase ever. Don't waste your money on this garbage.",
    "The build quality is solid and the screen is bright and responsive. I noticed some minor lag when running multiple apps, but it's not a deal breaker. The price point is reasonable for what you get.",
    "AMAZING PRODUCT!!! BEST THING I'VE EVER BOUGHT!!! TOTALLY RECOMMEND TO EVERYONE!!!",
  ]

  return sampleReviews.map((text) => generateDetailedMockAnalysis(text))
}
