export interface CreateOrderDto {
    shipping_address_id: number;
    payment_method: "cod" | "esewa";
    notes: string | undefined;
    transaction_uuid: string;
}

export interface OrderType {
    product_id: string;
    public_id: string;
    variant_id: string;
    product_name: string;
    quantity: number;
    unit_price: string;
    created_at: string;
    cancelled_at: string;
    status: string;
    order_id: string;
    transaction_id: string;
    slug: string;
    color: string;
    hex_color: string;
    size: string;
    url: string;
    alt_text: string;
}
