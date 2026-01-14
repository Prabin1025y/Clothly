import { axiosClient } from "@/lib/axios";
import type { AddReviewDto, AddReviewResponseType, ReviewType } from "@/type/review";

export const reviewServices = {
    addReview: async (reviewInfo: AddReviewDto): Promise<AddReviewResponseType> => {
        const formData = new FormData();
        formData.append("product_id", reviewInfo.product_id);
        formData.append("titile", "example titile");
        formData.append("body", reviewInfo.body);
        if (reviewInfo.image)
            formData.append("image", reviewInfo.image)
        const { data } = await axiosClient.post<AddReviewResponseType>("/api/reviews/add-review", reviewInfo);
        return data;
    },

    getReviews: async (productId: string): Promise<ReviewType[]> => {
        const { data } = await axiosClient.get<ReviewType[]>(`/api/reviews/${productId}`);
        return data;
    }
}