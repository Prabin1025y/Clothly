import { axiosClient } from "@/lib/axios";
import type { GetProductResponsetype, ProductFilters, ProductType, RecommendedProduct } from "@/type/product";

export const productServices = {
    getProductWithFilters: async (
        page: number = 1,
        limit: number = 12,
        filters?: ProductFilters
    ): Promise<GetProductResponsetype> => {
        const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(filters?.sort && { sort: filters.sort }),
            ...(filters?.min && { min: filters.min.toString() }),
            ...(filters?.max && { max: filters.max.toString() }),
            ...(filters?.search && { search: filters.search })
        })

        if (filters?.sizes) {
            filters.sizes.forEach(size => {
                params.append("size", size)
            })
        }
        const { data } = await axiosClient.get<GetProductResponsetype>(`/api/products/get-products-with-filters?${params.toString()}`)
        return data;
    },

    getProductDetail: async (slug: string): Promise<ProductType> => {
        const { data } = await axiosClient.get<ProductType>(`/api/products/get-product/${slug}`);
        return data;
    },

    getRecommendedProducts: async (): Promise<RecommendedProduct[]> => {
        const { data } = await axiosClient.get<RecommendedProduct[]>("/api/products/get-recent-products");
        return data;
    }
}