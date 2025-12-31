"use client"

import { useState, useRef } from "react"
import { Heart, MoreVertical } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ReviewForm from "./ReviewForm"
import { formatDistanceToNow } from "date-fns"
import { useGetReviews } from "@/hooks/useReviews"
import type { ReviewType } from "@/type/review"

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

interface ReviewSectionProps {
    productId: string
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
    // const [ hoveredCommentId, setHoveredCommentId ] = useState<string | null>(null)

    const { data, isFetching, isLoading, isError, error } = useGetReviews(productId);


    return (
        <div className="flex flex-col gap-6">
            {/* Comments List */}
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
                {(
                    () => {
                        if (isError)
                            return <div>Error...</div>

                        if (isLoading || !data)
                            return <div>Loading...</div>

                        const reviews = data;

                        return reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                            // isHovered={hoveredCommentId === review.id}
                            // onHover={setHoveredCommentId}
                            // onLike={onLike}
                            // onDelete={onDelete}
                            // onEdit={onEdit}
                            />
                        ))
                    }
                )()
                }
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-border pt-4">
                <ReviewForm />
            </div>
        </div>
    )
}

interface ReviewCardProps {
    review: ReviewType
    // isHovered: boolean
    // onHover: (id: string | null) => void
    // onLike: (commentId: string) => void
    // onDelete?: (commentId: string) => void
    // onEdit?: (commentId: string, content: string) => void
}

function ReviewCard({ review }: ReviewCardProps) {
    const [ showMenu, setShowMenu ] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)
    console.log(review.is_owner)

    return (
        <div
            className="group flex gap-3 pb-4 border-b border-border/50 last:border-b-0"
            // onMouseEnter={() => onHover(comment.id)}
            onMouseLeave={() => {
                // onHover(null)
                setShowMenu(false)
            }}
        >
            {/* Avatar */}
            <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage src={review.image_url} alt={review.full_name} />
                <AvatarFallback>{review.full_name}</AvatarFallback>
            </Avatar>

            {/* Comment Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground">{review.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(review.created_at, { addSuffix: true })}
                            </p>
                        </div>
                    </div>

                    {/* Like Button & Menu */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            // onClick={() => onLike(comment.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
                        >
                            <Heart
                                size={16}
                                className={`transition-colors ${true ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                            />
                            <span className="text-xs font-medium text-foreground">{review.helpful_count}</span>
                        </button>

                        {/* Menu Button */}
                        {review.is_owner && (
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
                                                // onDelete?.(comment.id)
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
                <p className="text-sm text-foreground mt-2 leading-relaxed">{review.body}</p>

                {/* Comment Image */}
                {review.images.length > 0 && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-border">
                        <img
                            src={review.images[ 0 ].url || "/placeholder.svg"}
                            alt={review.images[ 0 ].alt_text}
                            className="w-full max-h-48 object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
