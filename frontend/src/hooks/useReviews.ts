import { handleApiError } from "@/lib/axios";
import { reviewServices } from "@/service/reviewService";
import type { AddReviewDto, ReviewType } from "@/type/review";
import { useUser } from "@clerk/clerk-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner";

export const reviewKeys = {
    all: [ 'reviews' ] as const,

    lists: () => [ ...reviewKeys.all, 'list' ] as const,
    list: (productId: string) => [ ...reviewKeys.lists(), productId ] as const,

    details: () => [ ...reviewKeys.all, 'details' ] as const,
    detail: (id: string) => [ ...reviewKeys.details(), id ] as const
}

export function useAddReview() {
    const queryClient = useQueryClient();
    const { isSignedIn, user } = useUser();

    return useMutation({
        mutationFn: reviewServices.addReview,

        onMutate: async (reviewInfo: AddReviewDto) => {
            if (!isSignedIn || !user)
                throw new Error("Please sign in to add review!!");

            await queryClient.cancelQueries({ queryKey: reviewKeys.list(reviewInfo.product_id) });

            const previousData = queryClient.getQueriesData({ queryKey: reviewKeys.list(reviewInfo.product_id) });

            queryClient.setQueriesData<ReviewType[]>(
                { queryKey: reviewKeys.list(reviewInfo.product_id) },
                (old) => {
                    if (!old) return old;

                    const newReview: ReviewType = {
                        ...reviewInfo,
                        created_at: new Date().toISOString(),
                        helpful_count: 0,
                        id: `tempId--${Date.now()}-${Math.round(Math.random() * 1E9)}`,
                        is_verified_purchase: false,
                        order_id: `tempId--${Date.now()}-${Math.round(Math.random() * 1E9)}`,
                        user_id: `tempId--${Date.now()}-${Math.round(Math.random() * 1E9)}`,
                        is_owner: false,
                        clerk_id: user.id || `tempId--${Date.now()}-${Math.round(Math.random() * 1E9)}`,
                        full_name: user.fullName ?? "Unknown User",
                        image_url: user.imageUrl
                    }

                    return [ newReview, ...old ];
                })

            return { previousData };
        },

        onError: (error, _variables, context) => {
            if (context?.previousData) {
                context.previousData.forEach(([ queryKey, data ]) => {
                    queryClient.setQueryData(queryKey, data);
                })
            }
            toast.error(handleApiError(error));
        },

        onSettled: (data, error) => {
            if (data?.product_id)
                queryClient.invalidateQueries({ queryKey: reviewKeys.list(data.product_id) })
            else
                toast.error(handleApiError(error))
        }
    })
}

export function useGetReviews(productId: string) {
    return useQuery({
        queryKey: reviewKeys.list(productId),
        queryFn: () => reviewServices.getReviews(productId),
        staleTime: 5 * 60 * 1000,
        enabled: !!productId
    })
}