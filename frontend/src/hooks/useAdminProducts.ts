import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductsService } from "@/service/adminProductsService";
import type { AdminProductsResponse, FilterOptions, EditProductFormDataTypes } from "@/type/adminProducts";
import { toast } from "sonner";
import { handleApiError } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";

export const adminProductsKeys = {
    all: [ 'admin', 'products' ] as const,
    details: () => [ ...adminProductsKeys.all, 'detail' ] as const,
    detail: (slug: string) => [ ...adminProductsKeys.details(), slug ] as const,
    lists: () => [ ...adminProductsKeys.all, 'list' ] as const,
    list: (page: number, limit: number, filters: FilterOptions) => [ ...adminProductsKeys.lists(), page, limit, filters ] as const,
    reviews: () => [ ...adminProductsKeys.all, 'review' ] as const,
    review: (slug: string) => [ ...adminProductsKeys.reviews(), slug ] as const
    // colors: () => [ ...adminProductsKeys.all, 'colors' ] as const,
    // color: (productId: string | number) => [ ...adminProductsKeys.colors(), productId ] as const,
    // sizes: () => [ ...adminProductsKeys.all, 'sizes' ] as const,
    // size: (productId: string | number, color: string) => [ ...adminProductsKeys.sizes(), productId, color ] as const,
};

export function useAdminProducts(page: number = 1, limit: number = 20, filters: FilterOptions) {
    return useQuery<AdminProductsResponse>({
        queryKey: adminProductsKeys.list(page, limit, filters),
        queryFn: () => adminProductsService.getProducts(page, limit, filters),
        staleTime: 30 * 1000, // 30 seconds
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

export function useUpdateAdminProducts() {
    const queryClient = useQueryClient();
    return useMutation<GeneralPostResponseType, unknown, { productInfo: EditProductFormDataTypes; productSlug: string }>({
        mutationFn: ({ productInfo, productSlug }) => adminProductsService.updateProduct(productInfo, productSlug),

        onSuccess: () => {
            toast.success("Product updated successfully!");
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


export function useAdminProductReviewsBySlug(slug: string) {
    return useQuery({
        queryKey: adminProductsKeys.review(slug),
        queryFn: () => adminProductsService.getProductReviewBySlug(slug),
    })
}

export function useDeleteProductBySlug() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (slug: string) => adminProductsService.deleteProductBySlug(slug),

        onSettled: (_data, _error, variable) => {
            queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() })
            queryClient.invalidateQueries({ queryKey: adminProductsKeys.detail(variable) })
        }
    })
}

