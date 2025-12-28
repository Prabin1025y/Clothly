import { productServices } from "@/service/productService";
import type { GetProductResponsetype, ProductFilters } from "@/type/product";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const productKeys = {
    all: [ 'products' ] as const,
    recommended: () => [ ...productKeys.all, 'recommended' ] as const,

    lists: () => [ ...productKeys.all, 'list' ] as const,
    list: (page: number, limit: number, filters?: ProductFilters) => [ ...productKeys.lists(), { page, limit, filters } ] as const,

    details: () => [ ...productKeys.all, 'detail' ] as const,
    detail: (slug: string) => [ ...productKeys.details(), slug ] as const
};

export function useGetProducts(
    page: number = 1,
    limit: number = 12,
    filters?: ProductFilters,
    options?: Omit<UseQueryOptions<GetProductResponsetype>, 'queryKey' | 'queryFn'>
) {
    return useQuery({
        queryKey: productKeys.list(page, limit, filters),
        queryFn: () => productServices.getProductWithFilters(page, limit, filters),
        staleTime: 5 * 60 * 1000,
        ...options
    })
}

export function useGetRecommendedProducts() {
    return useQuery({
        queryKey: productKeys.recommended(),
        queryFn: () => productServices.getRecommendedProducts(),
        staleTime: 5 * 60 * 1000
    });
}

export function useGetProductInfo(slug: string | undefined) {
    return useQuery({
        queryKey: productKeys.detail(slug ?? ""),
        queryFn: () => productServices.getProductDetail(slug || ""),
        staleTime: 5 * 60 * 1000,
        enabled: !!slug
    })
}