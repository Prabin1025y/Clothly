import ReviewForm from "./ReviewForm"
import { useGetReviews } from "@/hooks/useReviews"
import ReviewCard from "./ReviewCard"

// export interface Comment {
//     id: string
//     author: {
//         name: string
//         avatar: string
//     }
//     content: string
//     image?: string
//     timestamp: Date
//     likes: number
//     liked: boolean
//     isOwn: boolean
// }

interface ReviewSectionProps {
    productId: string
}

export default function ReviewSection({ productId }: ReviewSectionProps) {

    const { data, isLoading, isError, error } = useGetReviews(productId);


    return (
        <div className="flex flex-col gap-6">
            {/* Comments List */}
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
                {(
                    () => {
                        if (isError)
                            return <div>Error...</div>

                        if (isLoading || !data) {
                            console.error(error);
                            return <div>Loading...</div>
                        }

                        const reviews = data;

                        return reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                            />
                        ))
                    }
                )()
                }
            </div>

            {/* Add Comment Form */}
            <div className="border-t border-border pt-4">
                <ReviewForm />
            </div>
        </div>
    )
}



