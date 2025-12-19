import { z } from 'zod'

// Schema for each image
const productImageSchema = z.object({
    url: z.string().url("Invalid image URL"),
    alt_text: z.string().max(512).optional(),
    is_primary: z.boolean().default(false),
});

// Schema for each product variants
const productVariantSchema = z.object({
    sku: z.string().min(1, "sku is required"),
    color: z.string().min(1, "color is required"),
    hex_color: z.string().trim().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color (expected #RRGGBB)" }).transform((v) => v.toUpperCase()),
    size: z.string().min(1, "size is required"),
    original_price: z.coerce.number().nonnegative(),
    current_price: z.coerce.number().nonnegative().optional(),
    available: z.coerce.number().int().nonnegative().default(0),
    reserved: z.coerce.number().int().nonnegative().default(0),
    on_hold: z.coerce.number().int().nonnegative().default(0)
})

const productDetailSchema = z.object({
    text: z.string().min(1, "Product detail's bullet cannot be empty")
})

export const productSchema = z.object({
    sku: z.string().min(1, "sku of product is required"),
    name: z.string().min(1, "name of product is required"),
    slug: z.string().min(1, "slug of product is required"),
    short_description: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["draft", "active", "archived"]).default("draft"),
    original_price: z.coerce.number().nonnegative(),
    current_price: z.coerce.number().nonnegative().optional(),
    currency: z.string().length(3).default("NPR"),
    is_featured: z.boolean().default(false),
    is_returnable: z.boolean().default(true),
    warranty_info: z.string().optional(),
    created_by: z.coerce.number().default(1),
    images: z.array(productImageSchema).min(1, "At least one image is required"),
    variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
    details: z.array(productDetailSchema).min(1, 'Please enter some details about the product')
})

export const getProductParamsSchema = z.object({
    limit: z.number().int().positive().default(12),
    page: z.number().int().positive().default(1)
}).strict()