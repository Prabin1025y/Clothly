
import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import { useUser } from "@clerk/clerk-react"
// import type { AddReviewDto } from "@/type/review"
import { useAddReview } from "@/hooks/useReviews"

export default function ReviewForm({ productId }: { productId: string }) {
    const [ content, setContent ] = useState("")
    const [ image, setImage ] = useState<string | null>(null)
    const [ imageFile, setImageFile ] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const addReview = useAddReview();

    const { user } = useUser();

    // const addReview = useAddReview();

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[ 0 ]
        if (!file) return
        setImageFile(file);

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

        setContent("")
        setImage(null)
        setImageFile(null)
        await addReview.mutateAsync({
            body: content,
            image: imageFile,
            imagePath: image,
            product_id: productId,
            rating: 4.0 //TODO 
        })


    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/placeholder.jpg"} alt={user?.fullName || "user avatar"} />
                    <AvatarFallback>Y</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    {/* Comment Input */}
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring min-h-12"
                        rows={2}
                    />

                    {/* Image Preview */}
                    {image && (
                        <div className="mt-3 relative w-fit">
                            <img
                                src={image || "/placeholder.svg"}
                                alt="Preview"
                                className="max-h-32 rounded-lg border border-border object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setImage(null)
                                    setImageFile(null)
                                    if (fileInputRef.current)
                                        fileInputRef.current.value = ""
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-3">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors"
                        >
                            <Upload size={16} />
                            <span>Add image</span>
                        </button>
                        <Button type="submit" disabled={!content.trim()} className="px-6 py-1.5 h-auto text-sm">
                            Comment
                        </Button>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </div>
            </div>
        </form>
    )
}
