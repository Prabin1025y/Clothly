import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { AdminProductsResponse, FilterOptions, AddProductFormDataTypes, EditProductFormDataTypes, AdminProductDetailType } from "@/type/adminProducts";
import type { ReviewType } from "@/type/review";

export const adminProductsService = {
    getProducts: async (page: number = 1, limit: number = 20, filters: FilterOptions): Promise<AdminProductsResponse> => {
        const { data } = await axiosClient.get<AdminProductsResponse>(`/api/admin/products?page=${page}&limit=${limit}&search=${filters.searchQuery}&status=${filters.status}&min=${filters.priceRange[ 0 ]}&max=${filters.priceRange[ 1 ]}&sortby=${filters.sortBy}&order=${filters.sortOrder}`);
        return data;
    },

    getProductBySlug: async (slug: string): Promise<AdminProductDetailType> => {
        const { data } = await axiosClient.get<AdminProductDetailType>(`/api/admin/products/${slug}`);
        return data;
    },

    addProduct: async (productInfo: AddProductFormDataTypes): Promise<GeneralPostResponseType> => {
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
    },

    updateProduct: async (productInfo: EditProductFormDataTypes, productSlug: string): Promise<GeneralPostResponseType> => {
        const formData = new FormData()
        let imageMetadataJson: { altText: string, isPrimary: boolean }[] = []
        const newImages = productInfo.images.filter(image => image.file)
        newImages.forEach(image => imageMetadataJson.push({ altText: image.altText, isPrimary: image.isPrimary }))

        const existingImages = productInfo.images.filter(image => !image.file);
        const existingImagesToBeSent = existingImages.map(image => ({ url: image.preview }))
        existingImages.forEach(image => imageMetadataJson.push({ altText: image.altText, isPrimary: image.isPrimary }))

        newImages.forEach((image) => {
            if (image.file)
                formData.append("images", image.file)
        })


        const variantsJson = productInfo.colorVariants.map(variant => ({
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            sizes: variant.sizes.map(s => ({ size: s.size, quantity: s.quantity }))
        }))
        const detailsJson = productInfo.details.map(detail => ({ text: detail.text }))

        formData.append("productName", productInfo.productName);
        formData.append("sku", productInfo.sku);
        formData.append("slug", productInfo.slug);
        formData.append("shortDescription", productInfo.shortDescription);
        formData.append("description", productInfo.description);
        formData.append("status", productInfo.status);
        formData.append("originalPrice", productInfo.originalPrice);
        formData.append("discountedPrice", productInfo.discountedPrice);
        formData.append("warranty", productInfo.warranty);
        formData.append("existingImage", JSON.stringify(existingImagesToBeSent))
        formData.append("imageMetadata", JSON.stringify(imageMetadataJson));
        formData.append("colorVariants", JSON.stringify(variantsJson));
        formData.append("details", JSON.stringify(detailsJson));

        const { data } = await axiosClient.put<GeneralPostResponseType>(`/api/admin/products/${productSlug}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        return data;
    },

    getProductReviewBySlug: async (slug: string): Promise<ReviewType[]> => {
        const { data } = await axiosClient.get<ReviewType[]>(`/api/admin/products/reviews/${slug}`);
        return data;
    },

    deleteProductBySlug: async (slug: string): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.delete<GeneralPostResponseType>(`/api/admin/products/${slug}`);
        return data;
    }
};

