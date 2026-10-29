import { type NextRequest, NextResponse } from "next/server"

// Mock settings data - in production, this would come from a database
let userSettings = {
  theme: "light",
  notifications: {
    email: true,
    push: false,
    sms: false,
    weeklyReport: true,
    securityAlerts: true,
  },
  privacy: {
    profileVisibility: "public",
    showEmail: false,
    showStats: true,
    allowDataCollection: true,
  },
  analysis: {
    autoAnalyze: true,
    confidenceThreshold: 70,
    batchSize: 100,
    saveHistory: true,
    exportFormat: "json",
  },
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: userSettings,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Update settings (in production, save to database)
    userSettings = {
      ...userSettings,
      ...body,
    }

    return NextResponse.json({
      success: true,
      data: userSettings,
      message: "Settings updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 })
  }
}
