import { z } from 'zod';

// Define the Zod schema for the shipping address data
export const shippingAddressSchema = z.object({
    label: z.string().trim().max(64, "Label must be 64 characters or less."),
    recipient_name: z.string().trim().min(1, "Recipient name is required.").max(255, "Recipient name must be 255 characters or less."),
    district: z.string().trim().min(1, "District is required.").max(512, "District must be 512 characters or less."),
    province: z.string().trim().min(1, "Province is required.").max(128, "Province must be 128 characters or less."),
    city: z.string().trim().min(1, "City is required.").max(128, "City must be 128 characters or less."),
    tole_name: z.string().trim().max(512, "Tole name must be 512 characters or less.").default(null).optional(),
    postal_code: z.string().trim().max(32, "Postal code must be 32 characters or less.").default(null).optional(),
    phone: z.string().trim().min(6, "Phone number is too short.").max(50, "Phone number must be 50 characters or less."),
    is_default: z.boolean().default(false).optional(),
}).strict(); // Use .strict() to forbid unknown keys in the input

export default shippingAddressSchema;