"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Globe, Calendar, BarChart3, Shield, Target, Save, Loader2 } from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string
  bio: string
  company: string
  location: string
  website: string
  joinDate: string
  reviewsAnalyzed: number
  fakeReviewsDetected: number
  accuracyRate: number
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      const result = await response.json()

      if (result.success) {
        setProfile(result.data)
      }
    } catch (error) {
      console.error("Failed to load profile")
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      const result = await response.json()

      if (result.success) {
        setProfile(result.data)
        setIsEditing(false)
      }
    } catch (error) {
      console.error("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const updateProfile = (field: keyof UserProfile, value: string | number) => {
    if (profile) {
      setProfile({ ...profile, [field]: value })
    }
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardShell>
    )
  }

  if (!profile) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Failed to load profile</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" description="Manage your account information and view your analytics">
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false)
                  fetchProfile()
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={saveProfile}
                disabled={isSaving}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400"
            >
              <User className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </DashboardHeader>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="glossy-card md:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24 ring-4 ring-offset-4 ring-blue-200 shadow-lg">
                <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.name} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-100 to-blue-200">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl font-bold">{profile.name}</CardTitle>
            <CardDescription className="text-base">{profile.email}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Joined {new Date(profile.joinDate).toLocaleDateString()}
            </div>
            {profile.company && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {profile.company}
              </div>
            )}
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4" />
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  {profile.website}
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="glossy-card md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information and bio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => updateProfile("name", e.target.value)}
                  disabled={!isEditing}
                  className="input-glossy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => updateProfile("email", e.target.value)}
                  disabled={!isEditing}
                  className="input-glossy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => updateProfile("bio", e.target.value)}
                disabled={!isEditing}
                className="input-glossy min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(e) => updateProfile("company", e.target.value)}
                  disabled={!isEditing}
                  className="input-glossy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => updateProfile("location", e.target.value)}
                  disabled={!isEditing}
                  className="input-glossy"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={profile.website}
                onChange={(e) => updateProfile("website", e.target.value)}
                disabled={!isEditing}
                className="input-glossy"
                placeholder="https://your-website.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Analytics Overview */}
        <Card className="glossy-card md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Your Analytics
            </CardTitle>
            <CardDescription>Overview of your fake review detection activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                <div className="flex items-center justify-center mb-2">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-blue-600">{profile.reviewsAnalyzed.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Reviews Analyzed</div>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <div className="flex items-center justify-center mb-2">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div className="text-3xl font-bold text-red-600">{profile.fakeReviewsDetected.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Fake Reviews Detected</div>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-green-600">{profile.accuracyRate}%</div>
                <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
