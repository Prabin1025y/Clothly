import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { CreateOrderDto, OrderType } from "@/type/orders";

export const orderServices = {
    createOrder: async (orderInfo: CreateOrderDto): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.post("/api/orders/create-order", orderInfo);
        return data;
    },

    getOrderByTransactionId: async (transactionId: string): Promise<OrderType[]> => {
        const { data } = await axiosClient.get(`/api/orders/order-items/${transactionId}`);
        return data;
    },

    getOrder: async (): Promise<OrderType[]> => {
        const { data } = await axiosClient.get("/api/orders/order-items");
        return data;
    },

    cancelOrder: async (public_id: string): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.delete(`/api/orders/cancel-order/${public_id}`);
        return data;
    }
}