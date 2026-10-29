import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { FlaggedReviews } from "@/components/dashboard/flagged-reviews"

export default function DashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" description="Monitor and analyze review patterns across your platforms." />
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Reviews</TabsTrigger>
          <TabsTrigger value="flagged">Flagged Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,853</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flagged Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">12% of total reviews</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2</div>
                <p className="text-xs text-muted-foreground">+0.3 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fake Review Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8.4%</div>
                <p className="text-xs text-muted-foreground">-2.1% from last month</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Review Analysis Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Fake Review Patterns</CardTitle>
                <CardDescription>Common patterns detected in flagged reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="flex-1">Excessive superlatives</div>
                      <div className="text-muted-foreground">42%</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <div className="flex-1">Lack of specific details</div>
                      <div className="text-muted-foreground">38%</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="flex-1">Multiple exclamation marks</div>
                      <div className="text-muted-foreground">35%</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex-1">Generic praise</div>
                      <div className="text-muted-foreground">29%</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <div className="flex-1">New account activity</div>
                      <div className="text-muted-foreground">24%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
              <CardDescription>The latest reviews across all your platforms</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentReviews />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="flagged" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flagged Reviews</CardTitle>
              <CardDescription>Reviews that have been flagged as potentially fake</CardDescription>
            </CardHeader>
            <CardContent>
              <FlaggedReviews />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
