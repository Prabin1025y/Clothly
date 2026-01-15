import { axiosClient } from "@/lib/axios";
import type { AdminProductsResponse, AdminProductColorsResponse, AdminProductSizesResponse } from "@/type/admin";

export const adminProductsService = {
    getProducts: async (page: number = 1, limit: number = 20): Promise<AdminProductsResponse> => {
        const { data } = await axiosClient.get<AdminProductsResponse>(`/api/admin/products?page=${page}&limit=${limit}`);
        return data;
    },

    getProductColors: async (productId: string | number): Promise<AdminProductColorsResponse> => {
        const { data } = await axiosClient.get<AdminProductColorsResponse>(`/api/admin/products/${productId}/colors`);
        return data;
    },

    getProductSizes: async (productId: string | number, color: string): Promise<AdminProductSizesResponse> => {
        const encodedColor = encodeURIComponent(color);
        const { data } = await axiosClient.get<AdminProductSizesResponse>(`/api/admin/products/${productId}/colors/${encodedColor}/sizes`);
        return data;
    }
};

