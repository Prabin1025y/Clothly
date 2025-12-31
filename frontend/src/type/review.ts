export interface AddReviewDto {
    product_id: number;
    rating: number;
    title: string;
    body: string;
    images: ReviewImage[]
}

export interface ReviewImage {
    url: string;
    alt_text: string;
}