import { Card } from "@/components/ui/card"

export function CartItemsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[ ...Array(6) ].map((_, idx) => (
                <Card key={idx} className="overflow-hidden">
                    {/* Image Skeleton */}
                    <div className="aspect-square w-full bg-gradient-to-br from-muted to-muted/50 animate-pulse" />

                    {/* Content Skeleton */}
                    <div className="p-4 space-y-3">
                        {/* Title Skeleton */}
                        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />

                        {/* Details Skeleton */}
                        <div className="space-y-2">
                            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                            <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                        </div>

                        {/* Buttons Skeleton */}
                        <div className="flex gap-2 pt-1">
                            <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                            <div className="h-8 bg-muted rounded animate-pulse flex-1" />
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}