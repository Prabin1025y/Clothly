import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductsService } from "@/service/adminProductsService";
import type { AdminProductsResponse, AdminProductColorsResponse, AdminProductSizesResponse, FilterOptions } from "@/type/adminProducts";
import { toast } from "sonner";
import { handleApiError } from "@/lib/axios";

export const adminProductsKeys = {
    all: [ 'admin', 'products' ] as const,
    details: () => [ ...adminProductsKeys.all, 'detail' ] as const,
    detail: (slug: string) => [ ...adminProductsKeys.details(), slug ] as const,
    lists: () => [ ...adminProductsKeys.all, 'list' ] as const,
    list: (page: number, limit: number, filters: FilterOptions) => [ ...adminProductsKeys.lists(), page, limit, filters ] as const,
    colors: () => [ ...adminProductsKeys.all, 'colors' ] as const,
    color: (productId: string | number) => [ ...adminProductsKeys.colors(), productId ] as const,
    sizes: () => [ ...adminProductsKeys.all, 'sizes' ] as const,
    size: (productId: string | number, color: string) => [ ...adminProductsKeys.sizes(), productId, color ] as const,
};

export function useAdminProducts(page: number = 1, limit: number = 20, filters: FilterOptions) {
    return useQuery<AdminProductsResponse>({
        queryKey: adminProductsKeys.list(page, limit, filters),
        queryFn: () => adminProductsService.getProducts(page, limit, filters),
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


export function useAddAdminProducts() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: adminProductsService.addProduct,

        onSuccess: () => {
            toast.success("Product added successfully!");
        },

        onError: (error) => {
            toast.error(handleApiError(error));
        },

        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() })
        }
    })
}

export function useAdminProductDetailBySlug(slug: string) {
    return useQuery({
        queryKey: adminProductsKeys.detail(slug),
        queryFn: () => adminProductsService.getProductBySlug(slug),
    })
}

