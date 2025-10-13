import { z } from "zod";

export const reviewSchema = z.object({
    product_id: z.int().min(1, "Invalid product id"),
    rating: z.number().min(0).max(5),
    title: z.string().optional(),
    body: z.string().optional(),
    images: z.array(z.string).optional()
})