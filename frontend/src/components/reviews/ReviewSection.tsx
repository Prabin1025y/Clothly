"use client"

import { useState, useRef } from "react"
import { Heart, MoreVertical } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ReviewForm from "./ReviewForm"
import { formatDistanceToNow } from "date-fns"

export interface Comment {
    id: string
    author: {
        name: string
        avatar: string
    }
    content: string
    image?: string
    timestamp: Date
    likes: number
    liked: boolean
    isOwn: boolean
}

interface CommentSectionProps {
    comments: Comment[]
    onAddComment: (comment: Omit<Comment, "id" | "timestamp" | "likes" | "liked">) => void
    onLike: (commentId: string) => void
    onDelete?: (commentId: string) => void
    onEdit?: (commentId: string, content: string) => void
}

export default function ReviewSection({ comments, onAddComment, onLike, onDelete, onEdit }: CommentSectionProps) {
    const [ hoveredCommentId, setHoveredCommentId ] = useState<string | null>(null)

    return (
        <div className="flex flex-col gap-6">
            {/* Comments List */}
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
                {comments.map((comment) => (
                    <ReviewCard
                        key={comment.id}
                        comment={comment}
                        isHovered={hoveredCommentId === comment.id}
                        onHover={setHoveredCommentId}
                        onLike={onLike}
                        onDelete={onDelete}
                        onEdit={onEdit}
                    />
                ))}
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-border pt-4">
                <ReviewForm onSubmit={onAddComment} />
            </div>
        </div>
    )
}

interface CommentCardProps {
    comment: Comment
    isHovered: boolean
    onHover: (id: string | null) => void
    onLike: (commentId: string) => void
    onDelete?: (commentId: string) => void
    onEdit?: (commentId: string, content: string) => void
}

function ReviewCard({ comment, isHovered, onHover, onLike, onDelete, onEdit }: CommentCardProps) {
    const [ showMenu, setShowMenu ] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    return (
        <div
            className="group flex gap-3 pb-4 border-b border-border/50 last:border-b-0"
            onMouseEnter={() => onHover(comment.id)}
            onMouseLeave={() => {
                onHover(null)
                setShowMenu(false)
            }}
        >
            {/* Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                <AvatarFallback>{comment.author.name[ 0 ]}</AvatarFallback>
            </Avatar>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{comment.author.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {/* Like Button & Menu */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => onLike(comment.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
                        >
                            <Heart
                                size={16}
                                className={`transition-colors ${comment.liked ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                            />
                            <span className="text-xs font-medium text-foreground">{comment.likes}</span>
                        </button>

                        {/* Menu Button */}
                        {comment.isOwn && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1.5 hover:bg-secondary rounded transition-colors"
                                >
                                    <MoreVertical size={16} className="text-muted-foreground" />
                                </button>
                                {showMenu && (
                                    <div
                                        ref={menuRef}
                                        className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg z-10"
                                    >
                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                // Implement edit functionality
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors text-foreground"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowMenu(false)
                                                onDelete?.(comment.id)
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Comment Text */}
                <p className="text-sm text-foreground mt-2 leading-relaxed">{comment.content}</p>

                {/* Comment Image */}
                {comment.image && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border">
                        <img
                            src={comment.image || "/placeholder.svg"}
                            alt="Comment attachment"
                            className="w-full max-h-48 object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
