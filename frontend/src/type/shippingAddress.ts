export interface shippingAddressType {
    id: string;
    label: string;
    recipient_name: string;
    district: string;
    province: string;
    city: string;
    tole_name: string;
    postal_code: string;
    phone: string;
    is_default: boolean;
    base_shipping_cost: string;
}

export interface getShippingAddressResponseType {
    success: boolean;
    data: shippingAddressType[];
}

export interface createShippingAddressDto {
    label: string;
    recipient_name: string;
    district: string;
    province: string;
    city: string;
    tole_name: string;
    postal_code: string;
    phone: string;
    is_default: boolean;
}
