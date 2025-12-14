import { axiosClient } from "@/lib/axios"
import type { addItemToCartDto, CartItemType, EditCartItemDto, GetCartItemDetailResponseType, GetCartItemsResponseType } from "@/type/cart";

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

    getCartItemDetail: async (cartItemId: string): Promise<GetCartItemDetailResponseType> => {
        const { data } = await axiosClient.get(`/api/carts/get-cart-item-detail/${cartItemId}`);
        return data;
    },

    editCartItem: async (updatedInfo: EditCartItemDto): Promise<void> => {
        const { cart_item_id, color, size, ...payload } = updatedInfo;
        const { data } = await axiosClient.post(`/api/carts/edit-item-in-cart`, payload);
        return data;
    }
}