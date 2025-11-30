export interface CartItemType {
    product_name: string,
    product_slug: string,
    id: number,
    variant_id: number,
    quantity: number,
    price_snapshot: number,
    added_at: Date,
    updated_at: Date
    product_image_alt_text: string,
    product_image_url: string
}

export interface CartResponseType {
    cart_id: string
    items: CartItemType[]
    total_price: string
    type: string
    user_id: string
}