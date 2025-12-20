import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useQuery } from '@tanstack/react-query'
import { GallerySkeleton } from "@/Skeletons/RecentProductsSkeleton"

interface GridItem {
    id: number
    image: string
    price: string
    title: string
    height: string,
    slug: string,
    alt_text: string
}

const HeightArray: string[] = [
    "380px", "420px", "320px", "300px", "400px", "290px",
    "370px", "410px", "240px", "330px", "310px", "340px"
]

interface gridItemType {
    public_id: number,
    url: string,
    current_price: number,
    name: string,
    average_rating: string,
    alt_text: string,
    slug: string
}

export function Gallery() {
    const [ hoveredItem, setHoveredItem ] = useState<number | null>(null)

    const { isPending, error, data } = useQuery({
        queryKey: [ 'recentProducts' ],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/get-recent-products`);
            if (!response.ok) {
                throw new Error('Network response was not ok')
            }
            const data = await response.json();
            return data;
        }
    })

    const gridItems: GridItem[] = data?.data?.map((item: gridItemType, index: number) => ({
        id: item.public_id,
        image: item.url,
        price: item.current_price,
        title: item.name,
        alt_text: item.alt_text,
        slug: item.slug,
        height: HeightArray[ index ]
    }))

    const mobileItems = gridItems?.slice(0, 8)

    if (isPending)
        return <GallerySkeleton />

    if (error)
        return <div>OOPS!! SOMETHING WENT WRONG!!</div>

    // console.log(data);

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
                        key={item.id}
                        className="relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl break-inside-avoid mb-4"
                        style={{ height: item.height }}
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        <img src={item.image || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />

                        <div
                            className={`
              absolute inset-0 bg-black/60 flex flex-col justify-end p-4 transition-opacity duration-300
              ${hoveredItem === item.id ? "opacity-100" : "opacity-0"}
            `}
                        >
                            <div className="text-white">
                                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                                <p className="text-accent font-bold text-xl mb-3">NPR.{item.price}</p>
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
                        key={item.id}
                        className="relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-xl aspect-[3/4]"
                        onMouseEnter={() => setHoveredItem(item.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                    >
                        {/* Image - clean and plain */}
                        <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                        />

                        {/* Gradient overlay - only visible on hover/click */}
                        <div
                            className={`
                    absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent
                    transition-opacity duration-300
                    ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0'}
                `}
                        />

                        {/* Content overlay - only visible on hover/click */}
                        <div
                            className={`
                    absolute inset-0 flex flex-col justify-end p-4
                    transition-opacity duration-300
                    ${hoveredItem === item.id ? 'opacity-100' : 'opacity-0'}
                `}
                        >
                            <div className="text-white">
                                <h3 className="font-semibold text-sm mb-1.5 line-clamp-2 leading-tight">
                                    {item.title}
                                </h3>
                                <p className="text-accent font-bold text-lg mb-3">
                                    NPR.{item.price}
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
