import { type NextRequest, NextResponse } from "next/server"

// Mock user data - in production, this would come from a database
let userData = {
  id: "user_123",
  name: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder.svg",
  bio: "AI researcher and fake review detection enthusiast",
  company: "Tech Solutions Inc.",
  location: "San Francisco, CA",
  website: "https://johndoe.dev",
  joinDate: "2023-01-15",
  reviewsAnalyzed: 2847,
  fakeReviewsDetected: 342,
  accuracyRate: 94.2,
}

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: userData,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Update user data (in production, save to database)
    userData = {
      ...userData,
      ...body,
      id: userData.id, // Don't allow ID changes
      joinDate: userData.joinDate, // Don't allow join date changes
    }

    return NextResponse.json({
      success: true,
      data: userData,
      message: "Profile updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}
