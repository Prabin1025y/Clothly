const ProductPageSkeleton = () => {
    return (
        <div className="min-h-screen bg-white p-4 md:p-8 animate-pulse">
            <div className="max-w-7xl mx-auto overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">

                    {/* Left Section – Images */}
                    <div className="space-y-4">

                        {/* Main Image */}
                        <div className="aspect-[10/11] bg-gray-200 rounded-lg w-full"></div>

                        {/* Thumbnails */}
                        <div className="grid grid-cols-5 gap-3">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="aspect-[4/5] bg-gray-200 rounded-md"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Right Section – Product Details */}
                    <div className="space-y-6">

                        {/* Title */}
                        <div className="h-10 bg-gray-200 rounded-md w-3/4"></div>

                        {/* Rating */}
                        <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
                                ))}
                            </div>
                            <div className="h-5 w-20 bg-gray-200 rounded"></div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4">
                            <div className="h-8 w-32 bg-gray-200 rounded"></div>
                            <div className="h-6 w-24 bg-gray-200 rounded"></div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-gray-200 rounded"></div>
                            <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                            <div className="h-4 w-4/6 bg-gray-200 rounded"></div>
                        </div>

                        {/* Color */}
                        <div>
                            <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                            <div className="flex gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-12 h-12 rounded-full bg-gray-200"
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div>
                            <div className="h-4 w-16 bg-gray-200 rounded mb-3"></div>
                            <div className="flex gap-3">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="px-6 py-2 bg-gray-200 rounded-md w-16 h-10"
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-gray-200 rounded-lg">
                                    <div className="px-4 py-2 bg-gray-200 w-10 h-10"></div>
                                    <div className="px-6 py-2 bg-gray-200 w-12 h-10"></div>
                                    <div className="px-4 py-2 bg-gray-200 w-10 h-10"></div>
                                </div>
                                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                            <div className="h-12 bg-gray-200 rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <section className="px-6 pt-6 md:px-10 md:pt-10">
                    <div className="flex gap-4">
                        <div className="h-10 w-28 bg-gray-200 rounded"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded"></div>
                    </div>

                    {/* Details content */}
                    <div className="mt-10 space-y-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-4 w-2/3 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </section>

            </div>

            <hr className="my-4 mx-4 md:mx-8 h-1 bg-gray-200" />

            {/* Recommended Carousel */}
            <section className="max-w-7xl mx-auto mt-6">
                <div className="flex gap-4 overflow-x-auto">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-48 h-64 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProductPageSkeleton;
