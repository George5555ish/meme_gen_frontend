"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThumbsUp, ThumbsDown, MessageCircle, Clock, ImageIcon } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { initialMemes } from "@/lib/meme-data"
import { BASE_URL } from "@/lib/utils"


interface MemeType {
  id: string | number;
  title: string
  imageUrl: string
  upvotes: number
  downvotes: number
  comments: number
  author: string,
  userVote: "up" | "down"| null,
  current_trend: string
  timestamp: number
}

export default function MemeGenerator() {
  const router = useRouter()
  const [memes, setMemes] = useState<MemeType[]>(initialMemes)
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 30,
    seconds: 0,
  })
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMeme, setNewMeme] = useState({
    title: "",
    imageUrl: "",
  })

  const fetchMemes = async () => {
    const response = await fetch(`${BASE_URL}/memes`)
    const data = await response.json()
    console.log(data)

    const memes = data.map((meme: any) => ({
      id: meme._id,
      title: meme.captions[0],
      imageUrl: BASE_URL+"/image/" + meme._id,
      upvotes: meme.upvotes,
      downvotes: meme.downvotes,
      comments: meme.comments,
      author: 'meme_generator',
      userVote: null,
      current_trend: meme.topic,
      timestamp: meme.timestamp
    }))
    setMemes(memes)
  }

  useEffect(() => {
    fetchMemes()
  }, [])
  // Handle voting
  const handleVote = (id: number | string, voteType: "up" | "down"| null) => {
    setMemes((prevMemes) =>
      prevMemes.map((meme) => {
        if (meme.id === id) {
          // If user already voted the same way, remove the vote
          if (meme.userVote === voteType) {
            return {
              ...meme,
              upvotes: voteType === "up" ? meme.upvotes - 1 : meme.upvotes,
              downvotes: voteType === "down" ? meme.downvotes - 1 : meme.downvotes,
              userVote: null,
            }
          }
          // If user voted the opposite way, remove the old vote and add the new one
          else if (meme.userVote !== null) {
            return {
              ...meme,
              upvotes: voteType === "up" ? meme.upvotes + 1 : meme.upvotes - 1,
              downvotes: voteType === "down" ? meme.downvotes + 1 : meme.downvotes - 1,
              userVote: voteType,
            }
          }
          // If user hasn't voted yet, add the vote
          return {
            ...meme,
            upvotes: voteType === "up" ? meme.upvotes + 1 : meme.upvotes,
            downvotes: voteType === "down" ? meme.downvotes + 1 : meme.downvotes,
            userVote: voteType,
          }
        }
        return meme
      }),
    )
  }

  // Handle creating a new meme
  const handleCreateMeme = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMeme.title.trim()) return

    const newMemeObj = {
      id: memes.length + 1,
      title: newMeme.title,
      imageUrl: newMeme.imageUrl || "/placeholder.svg?height=300&width=500",
      upvotes: 0,
      downvotes: 0,
      comments: 0,
      author: "currentUser",
      userVote: null,
      current_trend: 'null',
      timestamp: Date.now()
    }

    setMemes([newMemeObj, ...memes])
    setNewMeme({ title: "", imageUrl: "" })
    setIsDialogOpen(false)
  }

  // Navigate to meme detail page
  const handleMemeClick = (id: number | string) => {
    router.push(`/meme/${id}`)
  }

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.hours === 0 && prev.minutes === 0 && prev.seconds === 0) {
          // Reset timer to 3 hours when it reaches zero
          return { hours: 3, minutes: 0, seconds: 0 }
        }

        let newHours = prev.hours
        let newMinutes = prev.minutes
        let newSeconds = prev.seconds - 1

        if (newSeconds < 0) {
          newSeconds = 59
          newMinutes -= 1
        }

        if (newMinutes < 0) {
          newMinutes = 59
          newHours -= 1
        }

        return { hours: newHours, minutes: newMinutes, seconds: newSeconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time with leading zeros
  const formatTime = (value: number) => {
    return value.toString().padStart(2, "0")
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Countdown Timer */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between py-4 border-b">
          <h1 className="text-2xl font-bold">Meme Generator</h1>
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
            <Clock className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">
              Next batch in: {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Meme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {memes.map((meme) => (
          <Card key={meme.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-0" onClick={() => handleMemeClick(meme.id)}>
              <div className="p-4 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/placeholder.svg?height=32&width=32`} />
                  <AvatarFallback>{meme.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{meme.author}</p>
                </div>
              </div>
              <div className="relative aspect-auto bg-muted">
                <img
                  src={meme.imageUrl || "/placeholder.svg"}
                  alt={meme.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{meme.title}</h3>
              </div>

              <div className="p-6">
                <h3 className="font-thin text-sm">{meme.current_trend}</h3>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${meme.userVote === "up" ? "text-blue-600" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(meme.id, "up")
                    }}
                  >
                    <ThumbsUp className="h-5 w-5" />
                    <span className="sr-only">Upvote</span>
                  </Button>
                  <span className="text-sm font-medium">{meme.upvotes}</span>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${meme.userVote === "down" ? "text-destructive" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleVote(meme.id, "down")
                    }}
                  >
                    <ThumbsDown className="h-5 w-5" />
                    <span className="sr-only">Downvote</span>
                  </Button>
                  <span className="text-sm font-medium">{meme.downvotes}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleMemeClick(meme.id)
                }}
              >
                <MessageCircle className="h-4 w-4" />
                <span>{meme.comments}</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Create New Meme Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button size="lg" className="fixed bottom-6 right-6 rounded-full shadow-lg">
            Create New Meme
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateMeme}>
            <DialogHeader>
              <DialogTitle>Create a New Meme</DialogTitle>
              <DialogDescription>
                Fill out the details below to create your meme. Click save when you're done.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a catchy title"
                  value={newMeme.title}
                  onChange={(e) => setNewMeme({ ...newMeme, title: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 bg-muted/50">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
                  <Input
                    id="image"
                    type="file"
                    className="hidden"
                    onChange={() => setNewMeme({ ...newMeme, imageUrl: "/placeholder.svg?height=300&width=500" })}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => document.getElementById("image")?.click()}
                  >
                    Select Image
                  </Button>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea id="description" placeholder="Add some context to your meme" />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Create Meme</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

