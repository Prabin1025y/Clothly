export interface CreateOrderDto {
    shipping_address_id: number;
    payment_method: "cod" | "esewa";
    notes: string | undefined;
    transaction_uuid: string;
}