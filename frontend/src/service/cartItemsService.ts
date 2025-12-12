import { axiosClient } from "@/lib/axios"
import type { addItemToCartDto, CartItemType, GetCartInfoFromVariantIdResponseType, GetCartItemsResponseType } from "@/type/cart";

export const cartItemsServices = {
    getCartItems: async (): Promise<GetCartItemsResponseType> => {
        const { data } = await axiosClient.get(`/api/carts/get-cart-items`);
        return data;
    },

    addItemToCart: async (newItem: addItemToCartDto): Promise<CartItemType> => {
        const { data } = await axiosClient.post(`/api/carts/add-item-to-cart`, { variant_id: newItem.variantId, quantity: newItem.quantity });
        return data;
    },

    deleteCartItem: async (variantId: string): Promise<void> => {
        await axiosClient.delete(`/api/carts/delete-cart-item/${variantId}`);
    },

    getCartInfoByVariantId: async (variantId: string): Promise<GetCartInfoFromVariantIdResponseType> => {
        const { data } = await axiosClient.get(`/api/carts/get-cart-info-by-variant-id/${variantId}`);
        return data;
    }
}