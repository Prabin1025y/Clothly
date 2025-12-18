import { handleApiError } from "@/lib/axios";
import { orderServices } from "@/service/orderService";
import type { CreateOrderDto } from "@/type/orders";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const orderKeys = {
    all: [ 'orders' ] as const,

    lists: () => [ ...orderKeys.all, "list" ] as const,
}

export function useCreateOrder() {
    const queryClient = useQueryClient();
    const { isSignedIn } = useUser();

    return useMutation({
        mutationFn: orderServices.createOrder,

        onMutate: async (orderInfo: CreateOrderDto) => {
            if (!isSignedIn)
                throw new Error("Please sign in first!");

            await queryClient.cancelQueries({ queryKey: orderKeys.lists() });

            return { orderInfo };
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        }

    })

}