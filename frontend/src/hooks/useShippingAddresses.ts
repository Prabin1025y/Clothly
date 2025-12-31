import { handleApiError } from "@/lib/axios";
import { shippingAddressService } from "@/service/shippingAddressService";
import type { CreateShippingAddressDto, ShippingAddressType } from "@/type/shippingAddress";
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
export function useShippingAddresses(options?: Omit<UseQueryOptions<ShippingAddressType[]>, 'queryKey' | 'queryFn'>) {
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
            queryClient.setQueriesData<ShippingAddressType[]>(
                { queryKey: shippingAddressKeys.lists() },
                (old) => {
                    if (!old) return old;

                    const optimisticShippingAddress: ShippingAddressType = {
                        ...newShippingAddress,
                        id: `temp-${Date.now()}`,
                        base_shipping_cost: "100.00",
                        is_default: false
                    }

                    return [ ...old, optimisticShippingAddress ];
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

//Delete a shippin address with optimistic update
export function useDeleteShippingAddress() {
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    return useMutation({
        mutationFn: shippingAddressService.deleteShippingAddress,

        onMutate: async (id: string) => {
            if (!userId)
                throw new Error("Sign in first!");

            await queryClient.cancelQueries({ queryKey: shippingAddressKeys.list(userId) });

            const previousAddresses = queryClient.getQueriesData({ queryKey: shippingAddressKeys.list(userId) });

            queryClient.setQueriesData<ShippingAddressType[]>(
                { queryKey: shippingAddressKeys.list(userId) },
                (old) => {
                    if (!old) return old;

                    return old.filter(address => address.id !== id)
                }
            )

            return { previousAddresses };
        },

        onError: (error, _variables, context) => {
            if (context?.previousAddresses) {
                context.previousAddresses.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                })
            }
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: shippingAddressKeys.list(userId ?? "") })
        }
    })
}

//Make a shipping address default
export function useMakeAddressDefault() {
    const queryClient = useQueryClient();
    const { userId } = useAuth();

    return useMutation({
        mutationFn: shippingAddressService.makeAddressDefault,

        onMutate: async (id: string) => {
            if (!userId)
                throw Error("Please Sign in first!!");

            await queryClient.cancelQueries({ queryKey: shippingAddressKeys.list(userId) })

            const previousData = queryClient.getQueriesData({ queryKey: shippingAddressKeys.list(userId) });

            //Optimistic Update
            queryClient.setQueriesData<ShippingAddressType[]>(
                { queryKey: shippingAddressKeys.list(userId) },
                (old) => {
                    if (!old) return old;

                    const optimisticData = old.map(address => {
                        if (address.is_default && address.id !== id)
                            return { ...address, is_default: false }
                        else if (!address.is_default && address.id === id)
                            return { ...address, is_default: true }
                        else
                            return address;
                    })

                    return optimisticData;
                }
            );

            return { previousData };
        },

        onError: (error, _variables, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                })
            }
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: shippingAddressKeys.list(userId ?? "") })
        }
    })
}