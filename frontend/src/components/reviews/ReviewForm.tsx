"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Upload, X } from "lucide-react"
import type { Comment } from "./ReviewSection"

interface CommentFormProps {
    onSubmit: (comment: Omit<Comment, "id" | "timestamp" | "likes" | "liked">) => void
}

export default function ReviewForm({ onSubmit }: CommentFormProps) {
    const [ content, setContent ] = useState("")
    const [ image, setImage ] = useState<string | null>(null)
    const [ uploadProgress, setUploadProgress ] = useState(0)
    const [ isUploading, setIsUploading ] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[ 0 ]
        if (!file) return

        // Simulate upload progress
        setIsUploading(true)
        setUploadProgress(0)

        const progressInterval = setInterval(() => {
            setUploadProgress((prev) => {
                if (prev >= 90) {
                    clearInterval(progressInterval)
                    return prev
                }
                return prev + Math.random() * 40
            })
        }, 100)

        // Read file as data URL
        const reader = new FileReader()
        reader.onload = (event) => {
            setImage(event.target?.result as string)
            clearInterval(progressInterval)
            setUploadProgress(100)
            setTimeout(() => setIsUploading(false), 300)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim()) return

        onSubmit({
            author: {
                name: "@currentuser",
                avatar: "/user-avatar.jpg",
            },
            content: content.trim(),
            image: image || undefined,
            isOwn: true,
        })

        setContent("")
        setImage(null)
        setUploadProgress(0)
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex gap-3">
                <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarImage src="/user-avatar.jpg" alt="Your avatar" />
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
                                    setUploadProgress(0)
                                }}
                                className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-destructive-foreground hover:bg-destructive/90 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {isUploading && uploadProgress < 100 && (
                        <div className="mt-3">
                            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-primary h-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Uploading... {Math.round(uploadProgress)}%</p>
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
                        <Button type="submit" disabled={!content.trim() || isUploading} className="px-6 py-1.5 h-auto text-sm">
                            Comment
                        </Button>
                    </div>

                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                </div>
            </div>
        </form>
    )
}
