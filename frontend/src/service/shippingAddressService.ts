import { axiosClient } from "@/lib/axios";
import type { getShippingAddressResponseType } from "@/type/shippingAddress";

// Get single product by ID
export const shippingAddressService = {
    getShippingAddresses: async (): Promise<getShippingAddressResponseType> => {
        const { data } = await axiosClient.get<getShippingAddressResponseType>(`/shipping-addresses/get-shipping-addresses`);
        return data;
    },

    addShippingAddress: async (): Promise<>
}