export interface AddReviewDto {
    product_id: string;
    rating: number;
    title: string;
    body: string;
    images: ReviewImage[]
}

export interface ReviewImage {
    url: string;
    alt_text: string;
}

export interface ReviewType {
    id: string;
    user_id: string;
    product_id: string;
    order_id: string;
    rating: number;
    title: string;
    body: string;
    images: ReviewImage[];
    is_verified_purchase: boolean;
    is_owner: boolean;
    helpful_count: number;
    created_at: string;
}

export interface AddReviewResponseType {
    product_id: string;
}