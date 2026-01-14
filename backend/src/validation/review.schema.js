import { z } from "zod";

// Schema for each image
const reviewImageSchema = z.object({
    url: z.string().url("Invalid image URL"),
    alt_text: z.string().max(512).optional()
});

export const reviewSchema = z.object({
    product_id: z.int().min(1, "Invalid product id"),
    rating: z.number().min(0).max(5),
    title: z.string().optional(),
    body: z.string().optional(),
    images: z.array(reviewImageSchema).optional()
})

export const addReviewSchema = z.object({
    product_id: z.coerce.number().int().positive("Product ID must be a positive integer"),
    rating: z.coerce.number().min(1).max(5, "Rating must be between 1 and 5"),
    title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be at most 100 characters"),
    body: z.string().min(10, "Review body must be at least 10 characters").max(5000, "Review body must be at most 5000 characters"),
    imageUrl: z.string().optional().default("")
})

