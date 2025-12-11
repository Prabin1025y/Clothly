export interface ShippingAddressType {
    id: string;
    label: string;
    recipient_name: string;
    district: string;
    province: string;
    city: string;
    tole_name: string | null;
    postal_code: string | null;
    phone: string;
    is_default: boolean;
    base_shipping_cost: string;
}

export interface GetShippingAddressResponseType {
    success: boolean;
    data: ShippingAddressType[];
}

export interface CreateShippingAddressDto {
    label: string;
    recipient_name: string;
    district: string;
    province: string;
    city: string;
    tole_name: string | null;
    postal_code: string | null;
    phone: string;
    is_default: boolean;
}
