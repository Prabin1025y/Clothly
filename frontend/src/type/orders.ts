export interface CreateOrderDto {
    shipping_address_id: number;
    payment_method: "cod" | "esewa";
    notes: string | undefined;
    transaction_uuid: string;
}

export interface OrderType {
    product_id: string;
    public_id: string;
    variant_id: number;
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

export interface AdminOrderItemType {
    id: string;
    public_id: string;
    product_id: string;
    variant_id: number;
    product_name: string;
    status: string;
    quantity: number;
    unit_price: string;
    total_price: string;
    cancelled_at: string | null;
    created_at: string;
    product: {
        slug: string;
        name: string;
        description: string;
    };
    variant: {
        color: string;
        hex_color: string;
        size: string;
    };
    image: {
        url: string;
        alt_text: string;
    };
}

export interface AdminOrderType {
    id: string;
    public_id: string;
    transaction_id: string;
    subtotal: string;
    shipping_cost: string;
    tax_amount: string;
    discount_amount: string;
    total_amount: string;
    status: string;
    currency: string;
    payment_method: "cod" | "esewa";
    placed_at: string;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    notes: string;
    created_at: string;
    updated_at: string;
    items: AdminOrderItemType[];
}

export interface AdminOrdersResponseType {
    data: AdminOrderType[];
    meta: {
        totalOrders: number;
        totalPages: number;
        page: number;
        limit: number;
    };
}

export interface AdminOrderFilterType {
    page: number;
    sort_filter: 'date_asc' | 'date_desc' | 'price_asc' | 'price_desc';
    status_filter: Array<'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded' | 'returned' | 'expired'>;
    search_query: string
}
