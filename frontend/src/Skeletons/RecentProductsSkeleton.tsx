export function GallerySkeleton() {
    const desktopHeights = [
        "380px", "420px", "320px", "300px",
        "400px", "290px", "370px", "410px",
        "240px", "330px", "310px", "340px"
    ]

    const mobileCount = 8

    return (
        <div className="w-full mx-auto p-6">
            {/* Header skeleton */}
            <div className="mb-4">
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Desktop Masonry Skeleton */}
            <div className="hidden md:block columns-3 lg:columns-4 gap-4 space-y-4">
                {desktopHeights.map((height, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-lg break-inside-avoid mb-4 bg-gray-200 animate-pulse"
                        style={{ height }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                    </div>
                ))}
            </div>

            {/* Mobile Grid Skeleton */}
            <div className="md:hidden grid grid-cols-2 gap-4">
                {Array.from({ length: mobileCount }).map((_, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-200 animate-pulse"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
                    </div>
                ))}
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