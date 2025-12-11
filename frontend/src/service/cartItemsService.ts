import { axiosClient } from "@/lib/axios"
import type { GetCartItemsResponseType } from "@/type/cart";

export const cartItemsServices = {
    getCartItems: async (): Promise<GetCartItemsResponseType> => {
        const { data } = await axiosClient.get(`/api/carts/get-cart-items`);
        return data;
    }
}