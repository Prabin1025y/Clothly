import { handleApiError } from "@/lib/axios";
import { orderServices } from "@/service/orderService";
import type { CreateOrderDto, OrderType } from "@/type/orders";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cartItemKeys } from "./useCartItems";

export const orderKeys = {
    all: [ 'orders' ] as const,

    lists: () => [ ...orderKeys.all, "list" ] as const,
    list: (transactionId: string) => [ ...orderKeys.lists(), transactionId ] as const
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
        },

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartItemKeys.all })
        }

    })

}

export function useOrderItemsByTransactionId(transactionId: string) {
    return useQuery({
        queryKey: orderKeys.list(transactionId),
        queryFn: () => orderServices.getOrderByTransactionId(transactionId),
        staleTime: Infinity,
        enabled: !!transactionId
    })
}

export function useOrderItems() {
    return useQuery({
        queryKey: orderKeys.lists(),
        queryFn: () => orderServices.getOrder(),
    })
}

export function useCancelOrder() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: orderServices.cancelOrder,

        onMutate: async (public_id: string) => {
            queryClient.cancelQueries({ queryKey: orderKeys.all });

            const previousOrders = queryClient.getQueriesData({ queryKey: orderKeys.lists() });

            //Optimistically update order list
            queryClient.setQueriesData<OrderType[]>(
                { queryKey: orderKeys.lists() },
                (old) => {
                    if (!old) return old;

                    return old.filter(order => order.public_id !== public_id);
                }
            );

            return { previousOrders };
        },

        onError: (error, _variables, context) => {
            if (context?.previousOrders) {
                context.previousOrders.map(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                })
            }
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
        }
    })
}