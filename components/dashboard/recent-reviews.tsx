"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Info } from "lucide-react"

const recentReviews = [
  {
    id: "1",
    user: {
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "AJ",
    },
    product: "Wireless Headphones X3",
    rating: 5,
    text: "These headphones are amazing! The sound quality is crystal clear and the battery lasts forever. Highly recommend to anyone looking for premium wireless headphones.",
    date: "2 hours ago",
    fakeProbability: 0.15,
    platform: "Amazon",
  },
  {
    id: "2",
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
  },
  {
    id: "3",
    user: {
      name: "Michael Chen",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "MC",
    },
    product: "Ultra HD 4K Monitor",
    rating: 4,
    text: "I've been using this monitor for about 3 weeks now for both work and gaming. The colors are vibrant and the resolution is excellent. My only complaint is that the built-in speakers aren't great, but I use external ones anyway.",
    date: "Yesterday",
    fakeProbability: 0.08,
    platform: "Newegg",
  },
  {
    id: "4",
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
  },
  {
    id: "5",
    user: {
      name: "David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
      initials: "DK",
    },
    product: "Ergonomic Office Chair",
    rating: 3,
    text: "The chair is comfortable for short periods, but after a few hours, I start to feel some discomfort in my lower back. Assembly was straightforward, and the materials seem durable. It's good for the price, but if you work long hours, you might want something with better lumbar support.",
    date: "2 days ago",
    fakeProbability: 0.05,
    platform: "Wayfair",
  },
]

export function RecentReviews() {
  const getStatusBadge = (probability: number) => {
    if (probability > 0.7) {
      return (
        <Badge variant="destructive">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Likely Fake
        </Badge>
      )
    } else if (probability > 0.3) {
      return (
        <Badge variant="outline" className="bg-yellow-100">
          <Info className="mr-1 h-3 w-3" />
          Suspicious
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Authentic
        </Badge>
      )
    }
  }

  const getRatingStars = (rating: number) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }

  return (
    <div className="space-y-8">
      {recentReviews.map((review) => (
        <div key={review.id} className="flex flex-col space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                <AvatarFallback>{review.user.initials}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">{review.user.name}</div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-yellow-500">{getRatingStars(review.rating)}</span>
                  <span className="text-xs text-muted-foreground">on {review.platform}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusBadge(review.fakeProbability)}
              <span className="text-xs text-muted-foreground">{review.date}</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium">{review.product}</h4>
            <p className="text-sm text-muted-foreground mt-1">{review.text}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
