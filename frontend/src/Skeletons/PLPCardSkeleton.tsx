const PLPCardSkeleton = () => {
    return (
        <div className="rounded-3xl sm:w-[clamp(250px,300px,350px)] font-[Inter]">
            {/* Image Container */}
            <div className="relative pt-8 px-8">
                <div className="relative">
                    {/* Product Image Skeleton */}
                    <div className="min-w-[130%] h-40 sm:h-80 absolute left-1/2 -translate-x-1/2 z-1">
                        <div className="w-full h-full bg-gray-200 rounded-2xl animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Card Content */}
            <div className="relative pt-20 sm:pt-40 pb-4 px-1 sm:px-4 text-center shadow-[13px_13px_22px_-20px_#e5e5e5] sm:shadow-[13px_13px_33px_-15px_#e5e5e5] mt-20 sm:mt-40 rounded-3xl bg-white">
                {/* Product Title Skeleton */}
                <div className="flex justify-center mb-2">
                    <div className="h-7 sm:h-8 w-48 bg-gray-200 rounded-lg animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                </div>

                {/* Description Skeleton */}
                <div className="flex flex-col items-center gap-2 mb-4">
                    <div className="h-3 sm:h-4 w-full max-w-[280px] bg-gray-200 rounded animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                    <div className="h-3 sm:h-4 w-3/4 max-w-[210px] bg-gray-200 rounded animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                </div>

                {/* Rating and Price Row Skeleton */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                    {/* Rating Skeleton */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            {[ 1, 2, 3, 4, 5 ].map((star) => (
                                <div key={star} className="w-3 h-3 bg-gray-200 rounded-sm animate-pulse" />
                            ))}
                        </div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                        </div>
                    </div>

                    {/* Price Skeleton */}
                    <div className="h-6 w-24 bg-gray-200 rounded-lg animate-pulse relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                    </div>
                </div>

                {/* Button Skeleton */}
                <div className="h-11 w-full bg-gray-200 rounded-full animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    )
}

export default PLPCardSkeleton