import Filters from "@/components/Filters"
import PLPCard from "@/components/PLPCard"
import { AlertOctagon, Filter, Loader2, Search, X } from "lucide-react"
import react, { useEffect, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import PLPCardSkeleton from "@/Skeletons/PLPCardSkeleton"
import FunctionalPagination from "@/components/Pagination"
import { productKeys, useGetProducts } from "@/hooks/useProducts"
import type { ProductFilters } from "@/type/product"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button"

const ProductListing = () => {
    const [ searchQuery, setSearchQuery ] = useState("")
    const [ heading, setHeading ] = useState("You Might Like These")
    const [ hoveredCardId, setHoveredCardId ] = useState<null | number>(null)
    const [ showFilters, setShowFilters ] = useState<Boolean>(true)

    //metadata to show.
    const [ limit, setLimit ] = useState(12);
    const [ page, setPage ] = useState(1);
    const [ filters, setFilters ] = useState<ProductFilters>({});


    const queryClient = useQueryClient()


    const { data, isError, error, isFetching, isLoading } = useGetProducts(page, limit, filters);


    // Clear Search Query used in cross icon of search
    const handleClearSearch = () => {
        setSearchQuery('');
        setHeading("You might like these")
        if (!filters.search || filters.search === "")
            return;

        setFilters(prev => {
            const { search, ...next } = prev;
            return next;
        });
    };

    // For handling search
    const handleSearch = async (e: react.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery === "" || searchQuery.trim() === "" || searchQuery.trim() === filters.search) return;

        setHeading(`Search result for "${searchQuery}"`)
        setFilters(prev => ({ ...prev, search: searchQuery.trim() }));
    }

    // Fetch items when searchQuery is empty for user experiences
    useEffect(() => {
        if (searchQuery !== "" || !filters.search) return;
        setHeading("You might like these")
        setFilters(prev => {
            const { search, ...next } = prev;
            return next;
        });
    }, [ searchQuery ]);


    const products = data?.data ?? []
    const totalProductsCount = data?.meta.totalProducts ?? 0

    return (
        <main className="gap-2 px-1 md:px-8 lg:px-12 xl:px-8 2xl:px-[calc(32*4px-2vw)] font-[Inter]">
            <div className=" xl:px-0 2xl:px-24 grid grid-cols-1 lg:grid-cols-4">
                {showFilters && <Filters setFilters={setFilters} />}


                {/* Product Listings  */}
                <section className="xl:col-span-3 col-span-full xl:row-span-full py-4 sm:py-6 xl:pl-6 pl-0">

                    {/* Search Bar */}
                    <div className="flex-1 relative mb-6">
                        <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <form onSubmit={handleSearch}>
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm sm:text-base"
                            />
                        </form>
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
                            <h2 className="pl-2 md:pl-0 text-xl md:text-2xl font-semibold text-foreground mt-4 sm:mt-5 mb-2">{heading ?? "You Might Like These"}</h2>
                            <p className="pl-2 md:pl-0 text-xs md:text-sm text-foreground/80 my-2">{(isFetching || isLoading) ? "Please wait a moment..." : (isError ? "Something went wrong!" : `Showing ${totalProductsCount > limit ? limit : totalProductsCount} out of ${totalProductsCount} items`)}</p>
                        </div>
                        <div onClick={() => setShowFilters(!showFilters)} className="flex pr-4 w-fit xl:hidden gap-2 text-foreground/80 items-center">
                            <Filter size={20} />
                            <p className=" text-sm">{showFilters ? "Hide Filters" : "Filters"}</p>
                        </div>


                    </div>

                    {/* Tees Grid */}
                    {
                        (
                            () => {
                                if (isLoading || isFetching)
                                    return <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4 lg:gap-6 md:translate-x-4 xl:translate-x-0">
                                        {
                                            Array.from({ length: 6 }).map((_, idx) => (
                                                <PLPCardSkeleton key={idx} />
                                            ))
                                        }
                                    </div>

                                if (isError)
                                    return <Empty >
                                        <EmptyHeader>
                                            <EmptyMedia variant="icon">
                                                <AlertOctagon color="red" />
                                            </EmptyMedia>
                                            <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                                            <EmptyDescription className="text-red-400">
                                                An error occured while fetching products. Please try again!!
                                            </EmptyDescription>
                                        </EmptyHeader>
                                        <EmptyContent>
                                            <div className="flex gap-2">
                                                {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                                                    <Loader2 className="animate-spin" /> Retrying...
                                                </Button> : <Button
                                                    className="cursor-pointer bg-red-500"
                                                    onClick={() => queryClient.invalidateQueries({ queryKey: productKeys.lists() })}
                                                >
                                                    Retry
                                                </Button>}
                                            </div>
                                        </EmptyContent>
                                    </Empty>

                                return <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4 lg:gap-6 md:translate-x-4 xl:translate-x-0">
                                    {
                                        products.map((product, idx) => (
                                            <PLPCard
                                                key={product.public_id}
                                                id={idx}
                                                isHovered={hoveredCardId == idx}
                                                setHoveredCardId={setHoveredCardId}
                                                data={product}
                                            />
                                        ))
                                    }
                                </div>

                            }
                        )()
                    }


                    {/* Pagination */}
                    <FunctionalPagination limit={limit} totalProducts={products.length} currentPage={page} />

                </section>

            </div>
        </main>
    )
}

export default ProductListing