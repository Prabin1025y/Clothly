import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { AdminProductsResponse, AdminProductColorsResponse, AdminProductSizesResponse, FilterOptions, ProductFormDataTypes } from "@/type/adminProducts";

export const adminProductsService = {
    getProducts: async (page: number = 1, limit: number = 20, filters: FilterOptions): Promise<AdminProductsResponse> => {
        const { data } = await axiosClient.get<AdminProductsResponse>(`/api/admin/products?page=${page}&limit=${limit}&search=${filters.searchQuery}&status=${filters.status}&min=${filters.priceRange[ 0 ]}&max=${filters.priceRange[ 1 ]}&sortby=${filters.sortBy}&order=${filters.sortOrder}`);
        return data;
    },

    getProductColors: async (productId: string | number): Promise<AdminProductColorsResponse> => {
        const { data } = await axiosClient.get<AdminProductColorsResponse>(`/api/admin/products/${productId}/colors`);
        return data;
    },

    getProductSizes: async (productId: string | number, color: string): Promise<AdminProductSizesResponse> => {
        const encodedColor = encodeURIComponent(color);
        const { data } = await axiosClient.get<AdminProductSizesResponse>(`/api/admin/products/${productId}/colors/${encodedColor}/sizes`);
        return data;
    },

    addProduct: async (productInfo: ProductFormDataTypes): Promise<GeneralPostResponseType> => {
        const imageMetadataJson = productInfo.images.map(image => ({ altText: image.altText, isPrimary: image.isPrimary }))
        const variantsJson = productInfo.colorVariants.map(variant => ({
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            sizes: variant.sizes.map(s => ({ size: s.size, quantity: s.quantity }))
        }))
        const detailsJson = productInfo.details.map(detail => ({ text: detail.text }))
        const payload = {
            productName: productInfo.productName,
            sku: productInfo.sku,
            slug: productInfo.slug,
            shortDescription: productInfo.shortDescription,
            description: productInfo.description,
            status: productInfo.status,
            originalPrice: productInfo.originalPrice,
            discountedPrice: productInfo.discountedPrice,
            warranty: productInfo.warranty,
            imageMetadata: JSON.stringify(imageMetadataJson),
            colorVariants: JSON.stringify(variantsJson),
            details: JSON.stringify(detailsJson)
        }
        const { data } = await axiosClient.post<GeneralPostResponseType>(`/api/admin/products`, payload);
        return data;
    }
};

