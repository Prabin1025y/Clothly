import { axiosClient } from "@/lib/axios";
import type { GeneralPostResponseType } from "@/type";
import type { AddReviewDto, AddReviewResponseType, ReviewType } from "@/type/review";

export const reviewServices = {
    addReview: async (reviewInfo: AddReviewDto): Promise<AddReviewResponseType> => {
        const formData = new FormData();
        formData.append("product_id", reviewInfo.product_id);
        formData.append("title", "title 1");
        formData.append("body", reviewInfo.body);
        formData.append("rating", reviewInfo.rating.toString());
        if (reviewInfo.image)
            formData.append("image", reviewInfo.image)

        console.log(reviewInfo)
        const { data } = await axiosClient.post<AddReviewResponseType>("/api/reviews/add-review", formData, { headers: { "Content-Type": "multipart/form-data" } });
        return data;
    },

    getReviews: async (productId: string): Promise<ReviewType[]> => {
        const { data } = await axiosClient.get<ReviewType[]>(`/api/reviews/${productId}`);
        return data;
    },

    deleteReview: async (reviewId: string): Promise<GeneralPostResponseType> => {
        const { data } = await axiosClient.delete<GeneralPostResponseType>(`/api/reviews/${reviewId}`);
        return data;
    }
}