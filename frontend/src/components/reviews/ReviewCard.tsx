import type { ReviewType } from "@/type/review"
import { useRef, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Heart, MoreVertical } from "lucide-react"


interface ReviewCardProps {
    review: ReviewType
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const [ showMenu, setShowMenu ] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    return (
        <div
            className="group flex gap-3 pb-4 border-b border-border/50 last:border-b-0"
            onMouseLeave={() => {
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
                                // className={`transition-colors ${false ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                                className={`transition-colors text-muted-foreground`}
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