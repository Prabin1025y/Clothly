import { z } from "zod";

const orderSchema = z.object({
    // cart_id: z.number().int().positive(),
    shipping_address_id: z.number().int().positive(),
    // billing_address_id: z.number().int().positive(),
    payment_method: z.string().max(255),
    notes: z.string().optional(),
    // total_amount: z.string(),
    // transaction_uuid: z.string(),
    // product_code: z.string()
});

export default orderSchema;