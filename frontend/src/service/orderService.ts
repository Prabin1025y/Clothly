import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { CreateOrderDto } from "@/type/orders";

export const orderServices = {
    createOrder: async (orderInfo: CreateOrderDto): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.post("/api/orders/create-order", orderInfo);
        return data;
    }
}