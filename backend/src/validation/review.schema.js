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

