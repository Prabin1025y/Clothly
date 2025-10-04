import Filters from "@/components/Filters"
import PLPCard from "@/components/PLPCard"
import { Search, X } from "lucide-react"
import { useState } from "react"
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

    const handleClearSearch = () => {
        setSearchQuery('');
    };
    return (
        <main className=" gap-2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-48 font-[Inter] ">
            <div className="md:px-8 xl:px-16 2xl:px-24  grid grid-cols-4">
                <Filters />

                {/* Product Listings  */}
                <section className=" lg:col-span-3 col-span-full row-span-full py-6 pl-6">

                    {/* Search Bar */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                        {searchQuery && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <h2 className="text-2xl font-semibold text-foreground  mt-5 mb-2">You Might Like These</h2>
                    <p className="text-sm text-foreground/80 my-2">Showing All Tees</p>

                    {/* Tees Grid */}
                    <div className="flex flex-wrap gap-6">
                        {Array.from({ length: 13 }).map((_, idx) => (
                            <PLPCard key={idx} id={idx} isHovered={hoveredCardId == idx} setHoveredCardId={setHoveredCardId} />
                        ))}
                    </div>
                    {/* Pagination */}
                    <Pagination className="mt-16">
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href="#" />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#" isActive>1</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">
                                    2
                                </PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationLink href="#">3</PaginationLink>
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationEllipsis />
                            </PaginationItem>
                            <PaginationItem>
                                <PaginationNext href="#" />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                </section>



            </div>
        </main>
    )
}

export default ProductListing