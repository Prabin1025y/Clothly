import { shippingAddressService } from "@/service/shippingAddressService";
import type { getShippingAddressResponseType } from "@/type/shippingAddress";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

// Fetch products list
export function useShippingAddresses(options?: Omit<UseQueryOptions<getShippingAddressResponseType>, 'queryKey' | 'queryFn'>) {
    const { userId } = useAuth();
    return useQuery({
        queryKey: [ userId ?? "", "shipping address" ],
        queryFn: () => shippingAddressService.getShippingAddresses(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        ...options,
    });
}