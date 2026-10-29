"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Shield, SettingsIcon, Save, Loader2, Mail, Smartphone, Zap } from "lucide-react"
import { useTheme } from "next-themes"

interface UserSettings {
  theme: string
  notifications: {
    email: boolean
    push: boolean
    sms: boolean
    weeklyReport: boolean
    securityAlerts: boolean
  }
  privacy: {
    profileVisibility: string
    showEmail: boolean
    showStats: boolean
    allowDataCollection: boolean
  }
  analysis: {
    autoAnalyze: boolean
    confidenceThreshold: number
    batchSize: number
    saveHistory: boolean
    exportFormat: string
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings")
      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error("Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      const result = await response.json()

      if (result.success) {
        setSettings(result.data)
        setTheme(result.data.theme)
      }
    } catch (error) {
      console.error("Failed to update settings")
    } finally {
      setIsSaving(false)
    }
  }

  const updateSettings = (section: keyof UserSettings, field: string, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [section]: {
          ...settings[section],
          [field]: value,
        },
      })
    }
  }

  const updateRootSetting = (field: keyof UserSettings, value: any) => {
    if (settings) {
      setSettings({
        ...settings,
        [field]: value,
      })
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

  if (!settings) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <p>Failed to load settings</p>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Settings" description="Manage your application preferences and account settings">
        <Button
          onClick={saveSettings}
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
              Save Settings
            </>
          )}
        </Button>
      </DashboardHeader>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 p-1 rounded-lg">
          <TabsTrigger value="general" className="font-body text-sm data-[state=active]:shadow-md">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="font-body text-sm data-[state=active]:shadow-md">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="privacy" className="font-body text-sm data-[state=active]:shadow-md">
            <Shield className="mr-2 h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger value="analysis" className="font-body text-sm data-[state=active]:shadow-md">
            <Zap className="mr-2 h-4 w-4" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="glossy-card">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel of your application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={settings.theme} onValueChange={(value) => updateRootSetting("theme", value)}>
                  <SelectTrigger className="input-glossy">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="deepblue">Deep Blue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="glossy-card">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified about important events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                </div>
                <Switch
                  id="email-notifications"
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => updateSettings("notifications", "email", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in your browser</p>
                  </div>
                </div>
                <Switch
                  id="push-notifications"
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => updateSettings("notifications", "push", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="weekly-report">Weekly Report</Label>
                  <p className="text-sm text-muted-foreground">Get a weekly summary of your activity</p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={settings.notifications.weeklyReport}
                  onCheckedChange={(checked) => updateSettings("notifications", "weeklyReport", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="security-alerts">Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about security-related events</p>
                </div>
                <Switch
                  id="security-alerts"
                  checked={settings.notifications.securityAlerts}
                  onCheckedChange={(checked) => updateSettings("notifications", "securityAlerts", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card className="glossy-card">
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control your privacy and data sharing preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="profile-visibility">Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => updateSettings("privacy", "profileVisibility", value)}
                >
                  <SelectTrigger className="input-glossy">
                    <SelectValue placeholder="Select visibility" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-email">Show Email Address</Label>
                  <p className="text-sm text-muted-foreground">Display your email on your public profile</p>
                </div>
                <Switch
                  id="show-email"
                  checked={settings.privacy.showEmail}
                  onCheckedChange={(checked) => updateSettings("privacy", "showEmail", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-stats">Show Statistics</Label>
                  <p className="text-sm text-muted-foreground">Display your analysis statistics publicly</p>
                </div>
                <Switch
                  id="show-stats"
                  checked={settings.privacy.showStats}
                  onCheckedChange={(checked) => updateSettings("privacy", "showStats", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="data-collection">Allow Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve our service by sharing anonymous usage data
                  </p>
                </div>
                <Switch
                  id="data-collection"
                  checked={settings.privacy.allowDataCollection}
                  onCheckedChange={(checked) => updateSettings("privacy", "allowDataCollection", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card className="glossy-card">
            <CardHeader>
              <CardTitle>Analysis Settings</CardTitle>
              <CardDescription>Configure how the fake review detection works</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-analyze">Auto-Analyze Reviews</Label>
                  <p className="text-sm text-muted-foreground">Automatically analyze reviews when pasted</p>
                </div>
                <Switch
                  id="auto-analyze"
                  checked={settings.analysis.autoAnalyze}
                  onCheckedChange={(checked) => updateSettings("analysis", "autoAnalyze", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="batch-size">Batch Processing Size</Label>
                <Select
                  value={settings.analysis.batchSize.toString()}
                  onValueChange={(value) => updateSettings("analysis", "batchSize", Number.parseInt(value))}
                >
                  <SelectTrigger className="input-glossy">
                    <SelectValue placeholder="Select batch size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 reviews</SelectItem>
                    <SelectItem value="100">100 reviews</SelectItem>
                    <SelectItem value="250">250 reviews</SelectItem>
                    <SelectItem value="500">500 reviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="save-history">Save Analysis History</Label>
                  <p className="text-sm text-muted-foreground">Keep a record of all analyzed reviews</p>
                </div>
                <Switch
                  id="save-history"
                  checked={settings.analysis.saveHistory}
                  onCheckedChange={(checked) => updateSettings("analysis", "saveHistory", checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="export-format">Export Format</Label>
                <Select
                  value={settings.analysis.exportFormat}
                  onValueChange={(value) => updateSettings("analysis", "exportFormat", value)}
                >
                  <SelectTrigger className="input-glossy">
                    <SelectValue placeholder="Select export format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
