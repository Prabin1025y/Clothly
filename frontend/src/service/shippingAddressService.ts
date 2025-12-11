import { axiosClient } from "@/lib/axios";
import type { CreateShippingAddressDto, GetShippingAddressResponseType, ShippingAddressType } from "@/type/shippingAddress";

// Get single product by ID
export const shippingAddressService = {
    getShippingAddresses: async (): Promise<GetShippingAddressResponseType> => {
        const { data } = await axiosClient.get<GetShippingAddressResponseType>(`/api/shipping-addresses/get-shipping-addresses`);
        return data;
    },

    addShippingAddress: async (shippingAddress: CreateShippingAddressDto): Promise<ShippingAddressType> => {
        const { data } = await axiosClient.post<ShippingAddressType>("/api/shipping-addresses/add-shipping-address", shippingAddress);
        return data;
    }
}