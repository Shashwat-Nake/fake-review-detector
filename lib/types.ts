export interface LanguagePattern {
  name: string
  value: string | number
  suspicious: boolean
  severity: "low" | "medium" | "high"
  description: string
}

export interface ReviewMetadata {
  userId?: string
  timestamp?: string
  deviceInfo?: string
  location?: string
  reviewCount?: number
  accountAge?: string
  verifiedPurchase?: boolean
  [key: string]: string | number | boolean | undefined
}

export interface SuspiciousFlag {
  id: string
  type: "language" | "behavior" | "content" | "temporal" | "metadata"
  severity: "low" | "medium" | "high"
  title: string
  description: string
  evidence: string[]
  confidence: number
}

export interface TrustIndicator {
  category: string
  score: number
  maxScore: number
  factors: string[]
}

export interface ReviewData {
  text: string
  fakeProbability: number
  trustScore: number
  sentimentScore: number
  languagePatterns: LanguagePattern[]
  flags: SuspiciousFlag[]
  trustIndicators: TrustIndicator[]
  metadata?: ReviewMetadata
  detailedAnalysis: {
    contentQuality: number
    languageAuthenticity: number
    userCredibility: number
    temporalConsistency: number
    overallConfidence: number
  }
}
