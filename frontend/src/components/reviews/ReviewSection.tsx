import ReviewForm from "./ReviewForm"
import { reviewKeys, useGetReviews } from "@/hooks/useReviews"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import ReviewCard from "./ReviewCard"
import { AlertOctagon, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useQueryClient } from "@tanstack/react-query";

interface ReviewSectionProps {
    productId: string
}

export default function ReviewSection({ productId }: ReviewSectionProps) {

    const { data, isLoading, isError, error, isFetching } = useGetReviews(productId);
    const queryClient = useQueryClient();


    return (
        <div className="flex flex-col gap-6">
            {/* Comments List */}
            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2">
                {(
                    () => {
                        if (isError) {
                            console.error(error);
                            return <Empty >
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <AlertOctagon color="red" />
                                    </EmptyMedia>
                                    <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                                    <EmptyDescription className="text-red-400">
                                        An error occured while fetching products. Please try again!!
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <div className="flex gap-2">
                                        {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                                            <Loader2 className="animate-spin" /> Retrying...
                                        </Button> : <Button
                                            className="cursor-pointer bg-red-500"
                                            onClick={() => queryClient.invalidateQueries({ queryKey: reviewKeys.list(productId) })}
                                        >
                                            Retry
                                        </Button>}
                                    </div>
                                </EmptyContent>
                            </Empty>
                        }

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



