export interface CartItemType {
    product_name: string,
    product_slug: string,
    id: number,
    variant_id: number,
    quantity: number,
    price_snapshot: number,
    added_at: Date,
    updated_at: Date
}