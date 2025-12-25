import Filters from "@/components/Filters"
import PLPCard from "@/components/PLPCard"
import { Filter, Search, X } from "lucide-react"
import react, { useEffect, useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import PLPCardSkeleton from "@/Skeletons/PLPCardSkeleton"
import FunctionalPagination from "@/components/Pagination"
import { useSearchParams } from "react-router"
import { useGetProducts } from "@/hooks/useProducts"
import type { ProductFilters } from "@/type/product"

export interface Product_ProductListingType {
    alt_text: string
    average_rating: string
    current_price: string
    is_featured: boolean
    name: string
    public_id: string
    short_description: string
    slug: string
    url: string
}

const ProductListing = () => {
    const [ searchQuery, setSearchQuery ] = useState("")
    const [ heading, setHeading ] = useState("You Might Like These")
    const [ isSearching, setIsSearching ] = useState(false)
    const [ isFiltering, setIsFiltering ] = useState(false)
    const [ searchQueryModified, setSearchQueryModified ] = useState(false)
    const [ hoveredCardId, setHoveredCardId ] = useState<null | number>(null)
    const [ showFilters, setShowFilters ] = useState<Boolean>(true)
    const [ products, setProducts ] = useState<Product_ProductListingType[]>([])

    //metadata to show.
    const [ limit, setLimit ] = useState(12);
    const [ page, setPage ] = useState(1);
    const [ filters, setFilters ] = useState<ProductFilters>({});

    const [ totalProductsCount, setTotalProductsCount ] = useState(0);

    const [ searchParams, setSearchParams ] = useSearchParams();
    const queryClient = useQueryClient()

    //Function to fetch data with all filters and search applied. Reused in apply filters, useQuery and search functionality
    // const fetchDataWithFilters = async () => {
    //     const sort_filter = searchParams.get("sort") ?? "";
    //     const sizes_filter = searchParams.getAll ? searchParams.getAll("size") : (searchParams.get("size") ? [ searchParams.get("size") ] : []);
    //     const min_filter = searchParams.get("min") ?? "";
    //     const max_filter = searchParams.get("max") ?? "";
    //     const search_query = searchParams.get("search") ?? "";

    //     const sortParam = sort_filter !== "" ? `&sort=${sort_filter}` : "";
    //     let sizeParam = ""
    //     if (sizes_filter.length > 0)
    //         sizes_filter.forEach(filter => sizeParam.concat(`&size=${filter}`))
    //     const minParam = min_filter !== "" ? `&min=${min_filter}` : "";
    //     const maxParam = max_filter !== "" ? `&max=${max_filter}` : "";
    //     const srchParam = search_query !== "" ? `search=${search_query}` : "";

    //     const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/get-products-with-filters?${srchParam}&limit=12&page=${searchParams.get("page") || 1}${sortParam}${sizeParam}${minParam}${maxParam}`);
    //     if (!response.ok) {
    //         throw new Error('Network response was not ok')
    //     }
    //     const filteredData = await response.json();
    //     return filteredData;
    // }

    const { data, isError, error, isFetching, isLoading, isPlaceholderData } = useGetProducts(page, limit, filters);


    // Clear Search Query used in cross icon of search
    // const handleClearSearch = () => {
    //     setSearchQuery('');
    // };

    // // For handling apply filters button
    // const handleFilterUpdate = async () => {
    //     setIsFiltering(true);
    //     queryClient.invalidateQueries({
    //         predicate: (query) => query.queryKey[ 0 ] === "products"
    //     })
    //     await refetch();
    //     setIsFiltering(false);
    // }

    // // For handling search
    // const handleSearch = async (e: react.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();
    //     if (searchQuery === "" || searchQuery === searchParams.get("search")) return;

    //     setIsSearching(true);
    //     setHeading(`Searching for "${searchQuery}"`)
    //     setSearchParams(searchParams => {
    //         searchParams.delete("page");
    //         searchParams.delete("search");
    //         if (searchQuery !== "")
    //             searchParams.append("search", searchQuery);
    //         return searchParams;
    //     });

    //     queryClient.invalidateQueries({
    //         predicate: (query) => query.queryKey[ 0 ] === "products"
    //     })
    //     refetch().finally(() => setIsSearching(false));
    // }

    // // Query to fetch item in first load of page
    // const { error, data, refetch, isFetching } = useQuery({
    //     queryKey: [ 'products', Object.fromEntries(searchParams.entries()), page ],
    //     staleTime: 5 * 60 * 1000, //5 mins cache time
    //     queryFn: fetchDataWithFilters
    // })

    // //Set products value, pagination/metadata from tanstack query
    // useEffect(() => {
    //     if (data?.success) {
    //         setProducts(data.data)
    //         setLimit(data.meta?.limit ?? 12)
    //         setPage(data.meta?.page ?? 1)
    //         setTotalProductsCount(data.meta?.totalProducts ?? 0)

    //         if (searchParams.get("search")) {
    //             setHeading(`Search result for "${searchParams.get("search")}"`)
    //             setSearchQuery(searchParams.get("search") ?? "")
    //         }
    //     }
    //     if (isFetching && searchParams.get("search"))
    //         setHeading(`Searching for "${searchParams.get("search")}"`)
    // }, [ data ])

    // // Hide filters by default in mobile device
    // useEffect(() => {
    //     const handleWindowResize = () => {
    //         if (window.innerWidth > 1280)
    //             setShowFilters(true)
    //         else {
    //             setShowFilters(false)
    //         }
    //     }
    //     handleWindowResize();
    //     window.addEventListener("resize", handleWindowResize);
    //     return () => window.removeEventListener("resize", handleWindowResize);
    // }, [])



    // // Fetch items when searchQuery is empty for user experiences
    // useEffect(() => {
    //     if (searchQuery !== "" && searchQuery !== searchParams.get("search") && !searchQueryModified) setSearchQueryModified(true)

    //     if (searchQuery === "" && searchParams.get("search") && searchQueryModified) {
    //         setSearchQuery('');
    //         setSearchParams(prev => {
    //             prev.delete("page");
    //             prev.delete("search")
    //             return prev;
    //         })
    //         queryClient.invalidateQueries({
    //             predicate: (query) => query.queryKey[ 0 ] === "products"
    //         })
    //         refetch().finally(() => setIsSearching(false));
    //     }
    // }, [ searchQuery ]);



    // Show this if data cannot be fetched in first load.
    if (isError)
        return <div>OOPS!! something went wrong</div>

    return (
        <main className="gap-2 px-1 md:px-8 lg:px-12 xl:px-8 2xl:px-[calc(32*4px-2vw)] font-[Inter]">
            <div className=" xl:px-0 2xl:px-24 grid grid-cols-1 lg:grid-cols-4">
                {showFilters && <Filters handleFilterUpdate={handleFilterUpdate} />}


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
                            <p className="pl-2 md:pl-0 text-xs md:text-sm text-foreground/80 my-2">{(isFetching || isSearching || isFiltering) ? "Please wait a moment..." : `Showing ${totalProductsCount > limit ? limit : totalProductsCount} out of ${totalProductsCount} items`}</p>
                        </div>
                        <div onClick={() => setShowFilters(!showFilters)} className="flex pr-4 w-fit xl:hidden gap-2 text-foreground/80 items-center">
                            <Filter size={20} />
                            <p className=" text-sm">{showFilters ? "Hide Filters" : "Filters"}</p>
                        </div>


                    </div>

                    {/* Tees Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4 lg:gap-6 md:translate-x-4 xl:translate-x-0">
                        {isFetching || isSearching || isFiltering ?
                            Array.from({ length: 6 }).map((_, idx) => (
                                <PLPCardSkeleton key={idx} />
                            ))
                            :
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

                    {/* Pagination */}
                    <FunctionalPagination limit={limit} totalProducts={totalProductsCount} currentPage={page} />

                </section>

            </div>
        </main>
    )
}

export default ProductListing