import { Card } from "@/components/ui/card"

export function ShippingInfoSkeleton() {
    return (
        <div className="w-full space-y-6">
            {/* Existing Addresses Skeleton */}
            <div className="space-y-3">
                {[ ...Array(2) ].map((_, idx) => (
                    <Card key={idx} className="p-4 border-2 border-transparent bg-gray-200">
                        <div className="flex items-start gap-4">
                            {/* Radio Button Skeleton */}
                            <div className="w-4 h-4 rounded-full bg-white animate-pulse mt-1" />

                            {/* Address Content Skeleton */}
                            <div className="flex-1 space-y-2">
                                {/* Label Skeleton */}
                                <div className="h-5 bg-white rounded animate-pulse w-1/3" />

                                {/* Recipient Name Skeleton */}
                                <div className="h-4 bg-white rounded animate-pulse w-1/2" />

                                {/* Address Line 1 Skeleton */}
                                <div className="h-4 bg-white rounded animate-pulse w-full" />

                                {/* Address Line 2 Skeleton */}
                                <div className="h-4 bg-white rounded animate-pulse w-3/4" />

                                {/* Phone Skeleton */}
                                <div className="h-4 bg-white rounded animate-pulse w-1/3" />

                                {/* Shipping Cost Skeleton */}
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="w-4 h-4 bg-white rounded animate-pulse" />
                                    <div className="h-4 bg-white rounded animate-pulse w-40" />
                                </div>
                            </div>

                            {/* More Options Button Skeleton */}
                            <div className="w-8 h-8 bg-white rounded animate-pulse" />
                        </div>
                    </Card>
                ))}
            </div>

        </div>
    )
}