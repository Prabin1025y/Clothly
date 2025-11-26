export interface Product {
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
    size: string;
    available: number;
}

export interface ModifiedProductVariant {
    color: string;
    sizes: {
        sku: string;
        size: string;
        available: number;
    }[];
}

export interface ProductDetail {
    text: string;
}
