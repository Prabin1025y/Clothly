import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { AdminOrderFilterType, AdminOrdersResponseType, CreateOrderDto, OrderType } from "@/type/orders";

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
    },

    getAdminOrder: async (filter: AdminOrderFilterType): Promise<AdminOrdersResponseType> => {
        const { page, search_query, sort_filter, status_filter } = filter;
        const params = `page=${page || 1}&search=${search_query || ""}&sort=${sort_filter}`
        for (const status of status_filter) {
            params.concat(`&status=${status}`)
        }
        const { data } = await axiosClient.get<AdminOrdersResponseType>(`/api/orders/order-items-admin?${params}`);
        return data;
    }
}