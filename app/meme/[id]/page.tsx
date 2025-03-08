"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ThumbsUp, ThumbsDown, ArrowLeft, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { initialMemes } from "@/lib/meme-data"
import { useParams } from 'next/navigation';
import { BASE_URL } from "@/lib/utils"

interface MemeType {
  id: number;
  title: string
  imageUrl: string
  upvotes: number
  downvotes: number
  comments: number
  author: string,
  userVote: "up" | "down" | null,
  current_trend: string
  timestamp: number
}

export default function MemePage() {
  const router = useRouter()
  const { id } = useParams();

  const [meme, setMeme] = useState<MemeType | undefined>(initialMemes[0])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "memefan42",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "This is hilarious! 😂",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      author: "codingwizard",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "I feel this on a spiritual level.",
      timestamp: "1 hour ago",
    },
    {
      id: 3,
      author: "designguru",
      avatar: "/placeholder.svg?height=40&width=40",
      content: "So accurate it hurts!",
      timestamp: "30 minutes ago",
    },
  ])
  const fetchMeme = async () => {
    const response = await fetch(`${BASE_URL}/meme/${id}`)
    const data = await response.json()
    console.log(data)

    const memeData = {
      id: data.meme._id,
      title: data.meme.captions[0],
      imageUrl: `${BASE_URL}/image/` + data.meme._id,
      upvotes: data.meme.upvotes,
      downvotes: data.meme.downvotes,
      comments: data.meme.comments,
      author: 'meme_generator',
      userVote: null,
      current_trend: data.meme.topic,
      timestamp: data.meme.timestamp
    }
    setMeme(memeData)
    setLoading(false)
  }

  useEffect(() => {
    fetchMeme()
  }, [])
  // Handle voting
  const handleVote = (voteType: "up" | "down" | null) => {
    if (!meme) return

    setMeme((prevMeme) => {
      if (!prevMeme) return prevMeme

      // If user already voted the same way, remove the vote
      if (prevMeme.userVote === voteType) {
        return {
          ...prevMeme,
          upvotes: voteType === "up" ? prevMeme.upvotes - 1 : prevMeme.upvotes,
          downvotes: voteType === "down" ? prevMeme.downvotes - 1 : prevMeme.downvotes,
          userVote: null,
        }
      }
      // If user voted the opposite way, remove the old vote and add the new one
      else if (prevMeme.userVote !== null) {
        return {
          ...prevMeme,
          upvotes: voteType === "up" ? prevMeme.upvotes + 1 : prevMeme.upvotes - 1,
          downvotes: voteType === "down" ? prevMeme.downvotes + 1 : prevMeme.downvotes - 1,
          userVote: voteType,
        }
      }
      // If user hasn't voted yet, add the vote
      return {
        ...prevMeme,
        upvotes: voteType === "up" ? prevMeme.upvotes + 1 : prevMeme.upvotes,
        downvotes: voteType === "down" ? prevMeme.downvotes + 1 : prevMeme.downvotes,
        userVote: voteType,
      }
    })
  }

  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!newComment.trim()) return

    const newCommentObj = {
      id: comments.length + 1,
      author: "currentUser",
      avatar: "/placeholder.svg?height=40&width=40",
      content: newComment,
      timestamp: "Just now",
    }

    setComments([...comments, newCommentObj])
    setNewComment("")

    // Update comment count in meme
    if (meme) {
      setMeme({
        ...meme,
        comments: meme.comments + 1,
      })
    }
  }

  if (!meme) {
    if (loading) {
      return <div className="container mx-auto px-4 py-8">Loading...</div>
    }
    return <div className="container mx-auto px-4 py-8">Meme not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6 flex items-center gap-2" onClick={() => router.push("/")}>
        <ArrowLeft className="h-4 w-4" />
        Back to Memes
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Meme Content */}
        <div className="md:col-span-2">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-4 flex items-center gap-2 border-b">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
                  <AvatarFallback>{meme.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{meme.author}</p>
                  <p className="text-sm text-muted-foreground">Posted 3 days ago</p>
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">{meme.title}</h1>
                <div className="relative aspect-auto bg-black rounded-lg mb-6" style={{ transform: "scale(1)" }}>
                  <img
                    src={meme.imageUrl || "/placeholder.svg"}
                    alt={meme.title}
                    className="w-full h-full object-cover"

                  />
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${meme.userVote === "up" ? "bg-primary/10 text-primary" : ""}`}
                      onClick={() => handleVote("up")}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Upvote {meme.upvotes}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`${meme.userVote === "down" ? "bg-destructive/10 text-destructive" : ""}`}
                      onClick={() => handleVote("down")}
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />
                      Downvote {meme.downvotes}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comments Section */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Comments ({comments.length})</h2>

              <div className="flex flex-col gap-4 mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="resize-none"
                />
                <Button className="self-end" onClick={handleCommentSubmit}>
                  <Send className="h-4 w-4 mr-2" />
                  Post Comment
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.avatar} />
                      <AvatarFallback>{comment.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{comment.author}</p>
                        <p className="text-xs text-muted-foreground">{comment.timestamp}</p>
                      </div>
                      <p className="text-sm mt-1">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

