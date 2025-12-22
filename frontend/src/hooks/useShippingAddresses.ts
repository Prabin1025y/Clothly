import { handleApiError } from "@/lib/axios";
import { shippingAddressService } from "@/service/shippingAddressService";
import type { CreateShippingAddressDto, GetShippingAddressResponseType, ShippingAddressType } from "@/type/shippingAddress";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { toast } from "sonner";

export const shippingAddressKeys = {
    all: [ 'shipping-addresses' ] as const,

    lists: () => [ 'shipping-addresses', 'list' ] as const,
    list: (userId: string) =>
        [ 'shipping-addresses', 'list', userId ] as const,
};

// Fetch shipping address list
export function useShippingAddresses(options?: Omit<UseQueryOptions<GetShippingAddressResponseType>, 'queryKey' | 'queryFn'>) {
    const { userId } = useAuth();
    return useQuery({
        queryKey: shippingAddressKeys.list(userId ?? ""),
        queryFn: () => shippingAddressService.getShippingAddresses(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}

// Create shipping address with optimistic update
export function useCreateShippingAddress() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: shippingAddressService.addShippingAddress,

        onMutate: async (newShippingAddress: CreateShippingAddressDto) => {
            // Cancel ongoing queries related to shipping query list display
            await queryClient.cancelQueries({ queryKey: shippingAddressKeys.lists() });

            // Snapshot previous value if we have to rollback
            const previousShippingAddresses = queryClient.getQueriesData({
                queryKey: shippingAddressKeys.lists(),
            });

            // Optimistically update - Add to all cached lists
            queryClient.setQueriesData<GetShippingAddressResponseType>(
                { queryKey: shippingAddressKeys.lists() },
                (old) => {
                    if (!old) return old;

                    const optimisticShippingAddress: ShippingAddressType = { //TODO
                        ...newShippingAddress,
                        id: `temp-${Date.now()}`,
                        base_shipping_cost: "100.00"
                    }

                    return {
                        ...old,
                        data: [ ...old.data, optimisticShippingAddress ],
                    };
                }
            );

            // This value is available in context in both onError and onSettled but is only used in onError to rollback.
            return { previousShippingAddresses };
        },

        onError: (error, _variables, context) => {
            // Rollback on error
            if (context?.previousShippingAddresses) {
                context.previousShippingAddresses.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            toast.error(handleApiError(error));
        },

        //This runs only if mutation succeeds
        onSuccess: (_data) => {
            toast.success('Product created successfully!');
        },

        //This always runs whether mutation fails or succeed
        onSettled: () => {
            // Refetch to sync with server
            queryClient.invalidateQueries({ queryKey: shippingAddressKeys.lists() });
        },
    })
}