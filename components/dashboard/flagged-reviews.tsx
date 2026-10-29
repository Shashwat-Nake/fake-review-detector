"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Flag, ThumbsDown } from "lucide-react"
import { useState } from "react"

const flaggedReviews = [
  {
    id: "1",
    user: {
      name: "Sarah Miller",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "SM",
    },
    product: "Smart Home Hub Pro",
    rating: 1,
    text: "Terrible product! Don't waste your money! It stopped working after just one day and customer service was no help at all.",
    date: "5 hours ago",
    fakeProbability: 0.72,
    platform: "Best Buy",
    flags: ["Extreme negativity without specifics", "Multiple exclamation marks", "New account (2 days old)"],
  },
  {
    id: "2",
    user: {
      name: "Emily Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "ER",
    },
    product: "Professional Blender",
    rating: 5,
    text: "Best blender ever!!! It blends EVERYTHING perfectly!!! I use it EVERY DAY and it's AMAZING!!! Everyone needs to buy this RIGHT NOW!!!",
    date: "Yesterday",
    fakeProbability: 0.89,
    platform: "Target",
    flags: [
      "Excessive superlatives",
      "Multiple exclamation marks",
      "Imperative language",
      "ALL CAPS for emphasis",
      "No specific details about product",
    ],
  },
  {
    id: "3",
    user: {
      name: "John Smith",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "JS",
    },
    product: "Ultra Gaming Laptop X9",
    rating: 5,
    text: "This is the best laptop I've ever used. The performance is unbelievable and the design is perfect. Everyone should buy this laptop immediately. You won't regret it!",
    date: "2 days ago",
    fakeProbability: 0.81,
    platform: "Amazon",
    flags: [
      "Generic praise without specifics",
      "Imperative language",
      "Account has 5 reviews for same brand",
      "Similar text pattern to other reviews",
    ],
  },
  {
    id: "4",
    user: {
      name: "Lisa Wang",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "LW",
    },
    product: "Premium Face Cream",
    rating: 5,
    text: "I can't believe how amazing this cream is! My skin looks 10 years younger after just one use! All my wrinkles disappeared overnight! This is a miracle product that everyone needs to try right now!!!",
    date: "3 days ago",
    fakeProbability: 0.95,
    platform: "Sephora",
    flags: [
      "Unrealistic claims",
      "Excessive superlatives",
      "Multiple exclamation marks",
      "Temporal inconsistency",
      "Imperative language",
    ],
  },
]

export function FlaggedReviews() {
  const [reviews, setReviews] = useState(flaggedReviews)

  const handleApprove = (id: string) => {
    setReviews(reviews.filter((review) => review.id !== id))
  }

  const handleRemove = (id: string) => {
    setReviews(reviews.filter((review) => review.id !== id))
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-red-100">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                    <AvatarFallback>{review.user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{review.user.name}</div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-yellow-500">
                        {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                      </span>
                      <span className="text-xs text-muted-foreground">on {review.platform}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="destructive">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {(review.fakeProbability * 100).toFixed(0)}% Fake
                </Badge>
              </div>

              <div>
                <h4 className="text-sm font-medium">{review.product}</h4>
                <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
              </div>

              <div className="bg-red-50 p-3 rounded-md">
                <div className="flex items-center mb-2">
                  <Flag className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm font-medium">Flagged for:</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                  {review.flags.map((flag, index) => (
                    <li key={index}>{flag}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleApprove(review.id)}
                  className="flex items-center"
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(review.id)}
                  className="flex items-center"
                >
                  <ThumbsDown className="mr-1 h-4 w-4" />
                  Remove
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
