import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Upload, X, Star, Loader2, Sparkles } from "lucide-react"
import type { ReviewType } from "@/type/review"
import { useUpdateReview } from "@/hooks/useReviews"
import { cn } from "@/lib/utils"

interface EditReviewPopupProps {
    review: ReviewType
    open: boolean
    onOpenChange: (open: boolean) => void
}

export default function EditReviewPopup({ review, open, onOpenChange }: EditReviewPopupProps) {
    const [ content, setContent ] = useState(review.body)
    const [ rating, setRating ] = useState(review.rating)
    const [ image, setImage ] = useState<string | null>(review.images[ 0 ]?.imageUrl || null)
    const [ imageFile, setImageFile ] = useState<File | null>(null)
    const [ hoveredRating, setHoveredRating ] = useState<number | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const updateReview = useUpdateReview()

    // Reset form when dialog opens/closes or review changes
    useEffect(() => {
        if (open) {
            setContent(review.body)
            setRating(review.rating)
            const existingImage = review.images[ 0 ]?.imageUrl || null
            setImage(existingImage)
            setImageFile(null)
        }
    }, [ open, review ])

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[ 0 ]
        if (!file) return
        setImageFile(file)

        // Read file as data URL
        const reader = new FileReader()
        reader.onload = (event) => {
            setImage(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        try {
            onOpenChange(false)
            await updateReview.mutateAsync({
                reviewId: review.id,
                productId: review.product_id,
                body: content,
                rating: rating,
                image: imageFile,
                imagePath: imageFile ? (image || null) : null, // If new file uploaded, don't send path. Otherwise send existing path or null
            })

        } catch (error) {
            // Error handling is done in the hook
        }
    }

    const displayRating = hoveredRating ?? rating

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
                {/* Header with gradient background */}
                <DialogHeader className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border/50">
                    <div className="absolute top-4 right-4 opacity-20">
                        <Sparkles className="h-16 w-16 text-primary" />
                    </div>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Edit Your Review
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-1">
                        Share your updated thoughts about this product
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
                    {/* Rating Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            Rating
                        </label>
                        <div className="flex items-center gap-2">
                            {[ 1, 2, 3, 4, 5 ].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(null)}
                                    className={cn(
                                        "transition-all duration-200 transform hover:scale-110 active:scale-95",
                                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full p-1"
                                    )}
                                >
                                    <Star
                                        className={cn(
                                            "h-8 w-8 transition-all duration-200",
                                            star <= displayRating
                                                ? "fill-yellow-400 text-yellow-400 drop-shadow-sm"
                                                : "fill-transparent text-muted-foreground/30"
                                        )}
                                    />
                                </button>
                            ))}
                            <span className="ml-2 text-sm font-medium text-muted-foreground">
                                {displayRating}.0
                            </span>
                        </div>
                    </div>

                    {/* Review Text */}
                    <div className="space-y-2">
                        <label htmlFor="review-content" className="text-sm font-medium text-foreground">
                            Your Review
                        </label>
                        <Textarea
                            id="review-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="min-h-[120px] resize-none transition-all focus:ring-2 focus:ring-primary/20"
                            rows={5}
                        />
                        <p className="text-xs text-muted-foreground">
                            {content.length} characters
                        </p>
                    </div>

                    {/* Image Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Image (Optional)</label>
                        {image ? (
                            <div className="relative group">
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-border bg-muted/30">
                                    <img
                                        src={image}
                                        alt="Review preview"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImage(null)
                                            setImageFile(null)
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = ""
                                            }
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-destructive/90 hover:bg-destructive rounded-full text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 z-10"
                                        aria-label="Remove image"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-32 border-2 border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 transition-all flex flex-col items-center justify-center gap-2 group"
                            >
                                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <Upload className="h-5 w-5 text-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                    Click to upload an image
                                </span>
                            </button>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateReview.isPending}
                            className="min-w-[100px]"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!content.trim() || updateReview.isPending}
                            className="min-w-[100px] bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                        >
                            {updateReview.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Update Review
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

