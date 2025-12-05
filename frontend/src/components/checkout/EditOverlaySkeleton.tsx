import { X } from 'lucide-react';

interface ProductEditOverlaySkeletonProps {
    onClose: () => void
}

export default function ProductDetailsSkeleton({ onClose }: ProductEditOverlaySkeletonProps) {
    return (
        <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-1 right-1 z-10 p-2 hover:bg-secondary rounded-full transition-colors"
                aria-label="Close overlay"
            >
                <X className="w-5 h-5 text-foreground" />
            </button>

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                {/* Product image skeleton */}
                <div className="flex items-center justify-center bg-secondary rounded-xl overflow-hidden">
                    <div className="w-full aspect-square bg-muted animate-pulse" />
                </div>

                {/* Product details skeleton */}
                <div className="flex flex-col justify-between gap-3">
                    {/* Header skeleton */}
                    <div className="space-y-2">
                        <div className="h-8 bg-muted rounded animate-pulse w-3/4" />
                        <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                    </div>

                    {/* Pricing skeleton */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-3">
                            <div className="h-7 bg-muted rounded animate-pulse w-24" />
                            <div className="h-6 bg-muted rounded animate-pulse w-20" />
                        </div>
                    </div>

                    {/* Stock status skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-20" />
                        <div className="h-4 bg-muted rounded animate-pulse w-16" />
                    </div>

                    {/* Color selector skeleton */}
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-12" />
                        <div className="flex gap-3 mt-2">
                            {[ 1, 2, 3 ].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Size selector skeleton */}
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-10" />
                        <div className="grid grid-cols-3 gap-2">
                            {[ 1, 2, 3 ].map((i) => (
                                <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
                            ))}
                        </div>
                    </div>

                    {/* Quantity selector skeleton */}
                    <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse w-16" />
                        <div className="flex items-center gap-3 bg-secondary rounded-lg p-2 w-fit">
                            <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                            <div className="w-8 h-6 bg-muted rounded animate-pulse" />
                            <div className="w-6 h-6 bg-muted rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-3 pt-4">
                        <div className="flex-1 h-12 bg-muted rounded-lg animate-pulse" />
                        <div className="flex-1 h-12 bg-muted rounded-lg animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
