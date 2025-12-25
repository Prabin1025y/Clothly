import { axiosClient } from "@/lib/axios";
import type { GetProductResponsetype, ProductFilters } from "@/type/product";

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
}