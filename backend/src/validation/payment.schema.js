import { z } from "zod";

const paymentSchema = z.object({
    total_amount: z.string(),
    transaction_uuid: z.string(),
    product_code: z.string()
});

export default paymentSchema;