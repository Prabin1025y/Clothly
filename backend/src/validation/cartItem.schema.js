import { z } from "zod";

export const cartItemSchema = z.object({
    variant_id: z.number().min(1, "invalid cart id."),
    quantity: z.int().min(1, "quantity cannot be less than 1"),
})