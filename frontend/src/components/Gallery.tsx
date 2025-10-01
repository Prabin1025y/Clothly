import { useState } from "react"
import { Button } from "@/components/ui/button"

interface GridItem {
    id: number
    image: string
    price: string
    title: string
    height: string
}

const gridItems: GridItem[] = [
    {
        id: 1,
        image: "/1.webp",
        price: "$2,450",
        title: "Luxury Timepiece",
        height: "380px",
    },
    {
        id: 2,
        image: "/2.webp",
        price: "$890",
        title: "Diamond Collection",
        height: "420px",
    },
    {
        id: 3,
        image: "/3.jpg",
        price: "$1,200",
        title: "Designer Handbag",
        height: "320px",
    },
    {
        id: 4,
        image: "/4.jpg",
        price: "$340",
        title: "Ceramic Art",
        height: "300px",
    },
    {
        id: 5,
        image: "/5.webp",
        price: "$1,850",
        title: "Vintage Camera",
        height: "400px",
    },
    {
        id: 6,
        image: "/6.webp",
        price: "$125",
        title: "Home Decor",
        height: "290px",
    },
    {
        id: 7,
        image: "/7.jpg",
        price: "$280",
        title: "Skincare Set",
        height: "370px",
    },
    {
        id: 8,
        image: "/8.jpg",
        price: "$95",
        title: "Coffee Collection",
        height: "410px",
    },
    {
        id: 9,
        image: "/9.webp",
        price: "$750",
        title: "Wooden Craft",
        height: "240px",
    },
    {
        id: 10,
        image: "/10.webp",
        price: "$280",
        title: "Skincare Set",
        height: "330px",
    },
    {
        id: 11,
        image: "/11.jpg",
        price: "$95",
        title: "Coffee Collection",
        height: "310px",
    },
    {
        id: 12,
        image: "/12.webp",
        price: "$750",
        title: "Wooden Craft",
        height: "340px",
    },
]

export function Galary() {
    const [ hoveredItem, setHoveredItem ] = useState<number | null>(null)

    const mobileItems = gridItems.slice(0, 8)

    return (
        <div className="w-full mx-auto p-6">
            <div className="mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Showcase</h2>
                {/* <p className="text-muted-foreground">Curated pieces for the discerning eye</p> */}
            </div>

            {/* Desktop Masonry - 9 items */}
            <div className="hidden md:block columns-3 lg:columns-4 gap-4 space-y-4">
                {gridItems.map((item) => (
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
                                <p className="text-accent font-bold text-xl mb-3">{item.price}</p>
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
                                    {item.price}
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
