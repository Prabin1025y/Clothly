import { shippingAddressService } from "@/service/shippingAddressService";
import type { createShippingAddressDto, getShippingAddressResponseType, shippingAddressType } from "@/type/shippingAddress";
import { useAuth } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";

export const shippingAddressKeys = {
    all: [ 'shipping-addresses' ] as const,

    lists: () => [ 'shipping-addresses', 'list' ] as const,
    list: (userId: string) =>
        [ 'shipping-addresses', 'list', userId ] as const,
};

// Fetch shipping address list
export function useShippingAddresses(options?: Omit<UseQueryOptions<getShippingAddressResponseType>, 'queryKey' | 'queryFn'>) {
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

        onMutate: async (newShippingAddress: createShippingAddressDto) => {
            // Cancel ongoing queries related to shipping query list display
            await queryClient.cancelQueries({ queryKey: shippingAddressKeys.lists() });

            // Snapshot previous value if we have to rollback
            const previousShippingAddresses = queryClient.getQueriesData({
                queryKey: shippingAddressKeys.lists(),
            });

            // Optimistically update - Add to all cached lists
            queryClient.setQueriesData<getShippingAddressResponseType>(
                { queryKey: shippingAddressKeys.lists() },
                (old) => {
                    if (!old) return old;

                    const optimisticShippingAddress: shippingAddressType = {
                        ...newShippingAddress,
                        id: `temp-${Date.now()}`,
                        base_shipping_cost: "100.00"
                    }

                    return {
                        ...old,
                        data: [ optimisticShippingAddress, ...old.data ],
                    };
                }
            );

            return { previousShippingAddresses };
        }
    })
}