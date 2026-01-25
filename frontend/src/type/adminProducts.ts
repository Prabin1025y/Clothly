export interface AdminProduct {
    id: number;
    public_id: string;
    sku: string;
    name: string;
    slug: string;
    short_description: string | null;
    status: string;
    original_price: string;
    current_price: string;
    sold_count: string;
    review_count: number;
    average_rating: string;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
    image_url: string | null;
    image_alt_text: string | null;
}

export interface AdminProductColor {
    color: string;
    hex_color: string;
    sized: AdminProductSize[]
}

export interface AdminProductSize {
    variant_id: number;
    sku: string;
    size: string;
    original_price: string;
    current_price: string;
    available: number;
    reserved: number;
    on_hold: number;
    barcode: string | null;
    created_at: string;
    updated_at: string;
}

export interface AdminProductsResponse {
    data: AdminProduct[];
    meta: {
        totalProducts: number;
        totalPages: number;
        page: number;
        limit: number;
    };
}

export interface AdminProductColorsResponse {
    success: boolean;
    data: AdminProductColor[];
}

export interface AdminProductSizesResponse {
    success: boolean;
    data: AdminProductSize[];
}

export interface FilterOptions {
    searchQuery: string
    status: "all" | "active" | "inactive"
    priceRange: [ number, number ]
    sortBy: "name" | "price" | "date" | "sold" | "rating"
    sortOrder: "asc" | "desc"
}


//Product Form Types
export interface ProductImage {
    id: string
    file: File
    preview: string
    altText: string
    isPrimary: boolean
}

export interface ProductDetail {
    id: string
    text: string
}

export interface ColorVariant {
    id: string
    colorName: string
    colorHex: string
    sizes: {
        id: string
        size: string
        quantity: number
    }[]
}


export interface AddProductFormDataTypes {
    productName: string
    sku: string
    slug: string
    shortDescription: string
    description: string
    status: string
    originalPrice: string
    discountedPrice: string
    warranty: string
    images: ProductImage[]
    details: ProductDetail[]
    colorVariants: ColorVariant[]
}

export interface EditProductFormDataTypes extends Omit<AddProductFormDataTypes, "images"> {
    images: (Omit<ProductImage, 'file'> & { file?: File })[]
}


export interface GetProductBySlugResponseType {
    product_sku: string;
    public_id: string;
    id: string;
    name: string;
    slug: string;
    description: string;
    short_description: string;
    status: string;
    warranty_info: string;
    original_price: string;
    current_price: string;
    images: {
        url: string;
        alt_text: string;
        is_primary: boolean;
    }[];
    variants: {
        sku: string;
        color: string;
        hex_color: string;
        size: string;
        variant_id: number;
        available: number;
    }[];
    details: {
        text: string;
    }[];
};
