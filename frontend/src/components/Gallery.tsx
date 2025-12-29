import { useState } from "react"
import { Button } from "@/components/ui/button"
import { GallerySkeleton } from "@/Skeletons/RecentProductsSkeleton"
import { useGetRecommendedProducts } from "@/hooks/useProducts"
import type { RecommendedProduct } from "@/type/product"

interface GridItemType {
    public_id: number;
    url: string;
    current_price: string;
    name: string;
    average_rating: string;
    height: string;
    slug: string;
    alt_text: string;
}

const HeightArray: string[] = [
    "380px", "420px", "320px", "300px", "400px", "290px",
    "370px", "410px", "240px", "330px", "310px", "340px"
]

export function Gallery() {
    const [ hoveredItem, setHoveredItem ] = useState<number | null>(null)

    const { isFetching, error, isError, data } = useGetRecommendedProducts();

    if (isFetching || !data)
        return <GallerySkeleton />

    if (isError) {
        console.error(error);
        return <div>OOPS!! SOMETHING WENT WRONG!!</div>
    }

    const gridItems: GridItemType[] = data?.map((item: RecommendedProduct, index: number) => ({
        ...item,
        height: HeightArray[ index ]
    }))

    const mobileItems = gridItems?.slice(0, 8)
    return (
        <div className="w-full mx-auto p-6">
            <div className="mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Showcase</h2>
                {/* <p className="text-muted-foreground">Curated pieces for the discerning eye</p> */}
            </div>

            {/* Desktop Masonry - 9 items */}
            <div className="hidden md:block columns-3 lg:columns-4 gap-4 space-y-4">
                {gridItems?.map((item) => (
                    <div
                        key={item.public_id}
                        className="relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl break-inside-avoid mb-4"
                        style={{ height: item.height }}
                        onMouseEnter={() => setHoveredItem(item.public_id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <img src={item.url || "/placeholder.svg"} alt={item.alt_text} className="w-full h-full object-cover" />

                        <div
                            className={`
              absolute inset-0 bg-black/60 flex flex-col justify-end p-4 transition-opacity duration-300
              ${hoveredItem === item.public_id ? "opacity-100" : "opacity-0"}
            `}
                        >
                            <div className="text-white">
                                <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                                <p className="text-accent font-bold text-xl mb-3">NPR.{item.current_price}</p>
                                <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium">
                                    See More
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile grid */}
            <div className="md:hidden grid grid-cols-2 gap-4">
                {mobileItems.map((item) => (
                    <div
                        key={item.public_id}
                        className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl aspect-[3/4]"
                        onMouseEnter={() => setHoveredItem(item.public_id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {/* Image - clean and plain */}
                        <img
                            src={item.url || "/placeholder.svg"}
                            alt={item.alt_text}
                            className="w-full h-full object-cover"
                        />

                        {/* Gradient overlay - only visible on hover/click */}
                        <div
                            className={`
                    absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                    transition-opacity duration-300
                    ${hoveredItem === item.public_id ? 'opacity-100' : 'opacity-0'}
                `}
                        />

                        {/* Content overlay - only visible on hover/click */}
                        <div
                            className={`
                    absolute inset-0 flex flex-col justify-end p-4
                    transition-opacity duration-300
                    ${hoveredItem === item.public_id ? 'opacity-100' : 'opacity-0'}
                `}
                        >
                            <div className="text-white">
                                <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 leading-tight">
                                    {item.name}
                                </h3>
                                <p className="text-accent font-bold text-lg mb-3">
                                    NPR.{item.current_price}
                                </p>

                                <Button
                                    size="sm"
                                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-xs py-2"
                                >
                                    View Details
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
