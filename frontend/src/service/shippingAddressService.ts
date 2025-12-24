import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { CreateShippingAddressDto, ShippingAddressType } from "@/type/shippingAddress";

// Get single product by ID
export const shippingAddressService = {
    getShippingAddresses: async (): Promise<ShippingAddressType[]> => {
        const { data } = await axiosClient.get<ShippingAddressType[]>(`/api/shipping-addresses/get-shipping-addresses`);
        return data;
    },

    addShippingAddress: async (shippingAddress: CreateShippingAddressDto): Promise<ShippingAddressType> => {
        const { data } = await axiosClient.post<ShippingAddressType>("/api/shipping-addresses/add-shipping-address", shippingAddress);
        return data;
    },

    deleteShippingAddress: async (id: string): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.delete<GeneralPostResponseType>(`/api/shipping-addresses/delete-shipping-address/${id}`);
        return data;
    },

    makeAddressDefault: async (id: string): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.patch<GeneralPostResponseType>(`/api/shipping-addresses/make-default/${id}`);
        return data;
    }
}