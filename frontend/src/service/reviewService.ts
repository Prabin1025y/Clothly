import { axiosClient } from "@/lib/axios";
import type { AddReviewDto, AddReviewResponseType, ReviewType } from "@/type/review";

export const reviewServices = {
    addReview: async (reviewInfo: AddReviewDto): Promise<AddReviewResponseType> => {
        const { data } = await axiosClient.post<AddReviewResponseType>("/api/reviews/add-review", reviewInfo);
        return data;
    },

    getReviews: async (productId: string): Promise<ReviewType[]> => {
        const { data } = await axiosClient.get<ReviewType[]>(`/api/reviews/${productId}`);
        return data;
    }
}