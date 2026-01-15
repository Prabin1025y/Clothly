import { useQuery } from "@tanstack/react-query";
import { adminProductsService } from "@/service/adminProductsService";
import type { AdminProductsResponse, AdminProductColorsResponse, AdminProductSizesResponse } from "@/type/admin";

export const adminProductsKeys = {
    all: ['admin', 'products'] as const,
    lists: () => [...adminProductsKeys.all, 'list'] as const,
    list: (page: number, limit: number) => [...adminProductsKeys.lists(), page, limit] as const,
    colors: () => [...adminProductsKeys.all, 'colors'] as const,
    color: (productId: string | number) => [...adminProductsKeys.colors(), productId] as const,
    sizes: () => [...adminProductsKeys.all, 'sizes'] as const,
    size: (productId: string | number, color: string) => [...adminProductsKeys.sizes(), productId, color] as const,
};

export function useAdminProducts(page: number = 1, limit: number = 20) {
    return useQuery<AdminProductsResponse>({
        queryKey: adminProductsKeys.list(page, limit),
        queryFn: () => adminProductsService.getProducts(page, limit),
        staleTime: 30 * 1000, // 30 seconds
    });
}

export function useAdminProductColors(productId: string | number | null) {
    return useQuery<AdminProductColorsResponse>({
        queryKey: adminProductsKeys.color(productId!),
        queryFn: () => adminProductsService.getProductColors(productId!),
        enabled: !!productId,
        staleTime: 30 * 1000,
    });
}

export function useAdminProductSizes(productId: string | number | null, color: string | null) {
    return useQuery<AdminProductSizesResponse>({
        queryKey: adminProductsKeys.size(productId!, color!),
        queryFn: () => adminProductsService.getProductSizes(productId!, color!),
        enabled: !!productId && !!color,
        staleTime: 30 * 1000,
    });
}

