import Filters from "@/components/Filters"
import PLPCard from "@/components/PLPCard"
import { Filter, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"


const ProductListing = () => {
    const [ searchQuery, setSearchQuery ] = useState("")
    const [ hoveredCardId, setHoveredCardId ] = useState<null | number>(null)
    const [ showFilters, setShowFilters ] = useState<Boolean>(true)

    useEffect(() => {
        window.addEventListener("resize", handleWindowResize);

        return () => window.removeEventListener("resize", handleWindowResize);
    }, [])

    const handleWindowResize = () => {
        if (window.innerWidth > 1280)
            setShowFilters(true)
        else {
            setShowFilters(false)
        }
    }

    const handleClearSearch = () => {
        setSearchQuery('');
    };
    return (
        <main className="gap-2 px-1 md:px-8 lg:px-12 xl:px-8 2xl:px-[calc(32*4px-2vw)] font-[Inter]">
            <div className=" xl:px-0 2xl:px-24 grid grid-cols-1 lg:grid-cols-4">
                {showFilters && <Filters />}


                {/* Product Listings  */}
                <section className="xl:col-span-3 col-span-full xl:row-span-full py-4 sm:py-6 xl:pl-6 pl-0">

                    {/* Search Bar */}
                    <div className="flex-1 relative mb-6">
                        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="pl-2 md:pl-0 text-xl md:text-2xl font-semibold text-foreground mt-4 sm:mt-5 mb-2">You Might Like These</h2>
                            <p className="pl-2 md:pl-0 text-xs md:text-sm text-foreground/80 my-2">Showing All Tees</p>
                        </div>
                        <div onClick={() => setShowFilters(!showFilters)} className="flex pr-4 w-fit xl:hidden gap-2 text-foreground/80 items-center">
                            <Filter size={20} />
                            <p className=" text-sm">{showFilters ? "Hide Filters" : "Filters"}</p>
                        </div>


                    </div>

                    {/* Tees Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4 lg:gap-6 md:translate-x-4 xl:translate-x-0">
                        {Array.from({ length: 13 }).map((_, idx) => (
                            <PLPCard key={idx} id={idx} isHovered={hoveredCardId == idx} setHoveredCardId={setHoveredCardId} />
                        ))}
                    </div>

                    {/* Pagination */}
                    <Pagination className="mt-10 sm:mt-12 md:mt-16">
                        <PaginationContent className="flex-wrap gap-1 sm:gap-0">
                            <PaginationItem>
                                <PaginationPrevious href="#" className="text-xs sm:text-sm" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive className="text-xs sm:text-sm">1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" className="text-xs sm:text-sm">
                                    2
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" className="text-xs sm:text-sm">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem className="hidden sm:block">
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" className="text-xs sm:text-sm" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                </section>

            </div>
        </main>
    )
}

export default ProductListing