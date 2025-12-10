import { axiosClient } from "@/lib/axios";
import type { createShippingAddressDto, getShippingAddressResponseType, shippingAddressType } from "@/type/shippingAddress";

// Get single product by ID
export const shippingAddressService = {
    getShippingAddresses: async (): Promise<getShippingAddressResponseType> => {
        const { data } = await axiosClient.get<getShippingAddressResponseType>(`/shipping-addresses/get-shipping-addresses`);
        return data;
    },

    addShippingAddress: async (shippingAddress: createShippingAddressDto): Promise<shippingAddressType> => {
        const { data } = await axiosClient.post<shippingAddressType>("/api/shipping-addresses/add-shipping-address", shippingAddress);
        return data;
    }
}