import { z } from "zod";

const orderSchema = z.object({
    // cart_id: z.number().int().positive(),
    shipping_address_id: z.number().int().positive(),
    billing_address_id: z.number().int().positive(),
    payment_method: z.string().max(255),
    notes: z.string().optional(),
});

export default orderSchema;