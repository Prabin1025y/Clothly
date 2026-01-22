import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { AdminProductsResponse, AdminProductColorsResponse, AdminProductSizesResponse, FilterOptions, ProductFormDataTypes, GetProductBySlugResponseType } from "@/type/adminProducts";

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

    getProductBySlug: async (slug: string): Promise<GetProductBySlugResponseType> => {
        const { data } = await axiosClient.get<GetProductBySlugResponseType>(`/api/admin/products/${slug}`);
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
        const formData = new FormData()
        formData.append("productName", productInfo.productName);
        formData.append("sku", productInfo.sku);
        formData.append("slug", productInfo.slug);
        formData.append("shortDescription", productInfo.shortDescription);
        formData.append("description", productInfo.description);
        formData.append("status", productInfo.status);
        formData.append("originalPrice", productInfo.originalPrice);
        formData.append("discountedPrice", productInfo.discountedPrice);
        formData.append("warranty", productInfo.warranty);
        formData.append("imageMetadata", JSON.stringify(imageMetadataJson));
        formData.append("colorVariants", JSON.stringify(variantsJson));
        formData.append("details", JSON.stringify(detailsJson));
        productInfo.images.forEach((image) => {
            formData.append("images", image.file)
        })
        const { data } = await axiosClient.post<GeneralPostResponseType>(`/api/admin/products`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        return data;
    }
};

