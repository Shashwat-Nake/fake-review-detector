import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, BarChart2, Brain, Clock, FileText, MessageCircle, User } from "lucide-react"

export function ReviewCriteria() {
  const criteria = [
    {
      icon: <MessageCircle className="h-6 w-6 text-red-600" />,
      title: "Language Patterns",
      description: "Excessive superlatives, ALL CAPS, multiple exclamation marks, and generic praise without specifics",
    },
    {
      icon: <BarChart2 className="h-6 w-6 text-red-600" />,
      title: "Sentiment Analysis",
      description: "Extremely positive or negative sentiment that seems disproportionate to the content",
    },
    {
      icon: <User className="h-6 w-6 text-red-600" />,
      title: "User Behavior",
      description: "New accounts, users with multiple reviews for the same brand, or unusual posting patterns",
    },
    {
      icon: <FileText className="h-6 w-6 text-red-600" />,
      title: "Content Analysis",
      description: "Lack of specific details, generic descriptions, or unrealistic claims about product performance",
    },
    {
      icon: <Clock className="h-6 w-6 text-red-600" />,
      title: "Temporal Patterns",
      description: "Multiple similar reviews in a short time period or reviews posted outside business hours",
    },
    {
      icon: <Brain className="h-6 w-6 text-red-600" />,
      title: "AI Detection",
      description: "Patterns consistent with AI-generated content, including repetitive phrasing or unnatural language",
    },
  ]

  return (
    <Card className="glossy-card rounded-xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border-b">
        <CardTitle className="flex items-center gap-3 font-serif text-3xl font-bold gradient-red-heading">
          <AlertTriangle className="h-7 w-7 text-red-500" />
          How We Detect Fake Reviews
        </CardTitle>
        <CardDescription className="font-body text-base leading-relaxed">
          Our sophisticated system analyzes multiple factors to determine the authenticity of reviews with high accuracy
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {criteria.map((criterion, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 p-5 border rounded-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 shadow-inner">
                  {criterion.icon}
                </div>
                <h3 className="font-serif text-xl font-semibold text-slate-700 dark:text-slate-200">
                  {criterion.title}
                </h3>
              </div>
              <p className="font-body text-base text-muted-foreground leading-relaxed">{criterion.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
