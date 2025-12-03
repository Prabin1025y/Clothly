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

type CartEditResponseType_SizeVariant = {
    size: string;
    available: number;
    variant_id: number;
    current_price: number;
};

type CartEditResponseType_ProductVariant = {
    color: string;
    sizes: CartEditResponseType_SizeVariant[];
};

export type CartEditResponseType = {
    name: string;
    short_description: string;
    variant_id: string; // The data sample uses a string "9" here
    current_price: string; // The data sample uses a string "42999.00" here
    original_price: string; // The data sample uses a string "45000.00" here
    size: string;
    color: string;
    available: number;
    cart_quantity: string; // The data sample uses a string "1" here
    primary_image_url: string;
    primary_image_alt_text: string;
    all_variants: CartEditResponseType_ProductVariant[];
};