export interface ProductType {
    product_sku: string;
    public_id: string;
    name: string;
    slug: string;
    description: string;
    original_price: string;   // can be changed to number if desired
    current_price: string;    // can be changed to number if desired
    sold_count: string;       // or number, depending on backend
    review_count: number;
    average_rating: string;   // or number (e.g., 0.00)
    is_featured: boolean;
    is_returnable: boolean;
    warranty_info: string;
    images: ProductImage[];
    variants: ProductVariant[];
    details: ProductDetail[];
    primary_image: ProductImage;
}

export interface ProductImage {
    url: string;
    alt_text: string;
    is_primary: boolean;
}

export interface ProductVariant {
    sku: string;
    color: string;
    hex_color: string;
    size: string;
    variant_id: number;
    available: number;
}

export interface ProductDetail {
    text: string;
}

//to be reviewed
export interface ModifiedProductVariant {
    color: string;
    hex_color: string;
    sizes: {
        sku: string;
        size: string;
        available: number;
        variant_id: number;
    }[];
}

export interface RecommendedProduct {
    public_id: number,
    url: string,
    current_price: string,
    name: string,
    average_rating: string,
    alt_text: string,
    slug: string
}

export interface ProductFilters {
    sort?: 'none' | 'price_desc' | 'price_asc' | 'time_desc' | 'time_asc' | 'popular';
    sizes?: string[];
    min?: number;
    max?: number;
    search?: string;
}

export interface GetProductResponsetype {
    data: {
        public_id: string;
        name: string;
        slug: string;
        short_description: string;
        current_price: string;
        average_rating: string;
        is_featured: boolean;
        url: string;
        alt_text: string;
    }[];
    meta: {
        totalProducts: number;
        totalPages: number;
        page: number;
        limit: number;
    }
}
