import Filters from "@/components/Filters"
import PLPCard from "@/components/PLPCard"
import { Filter, Search, X } from "lucide-react"
import react, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import PLPCardSkeleton from "@/Skeletons/PLPCardSkeleton"
import FunctionalPagination from "@/components/Pagination"
import { useSearchParams } from "react-router"

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
    const [ isSearching, setIsSearching ] = useState(false)
    const [ hoveredCardId, setHoveredCardId ] = useState<null | number>(null)
    const [ showFilters, setShowFilters ] = useState<Boolean>(true)

    const [ products, setProducts ] = useState<Product_ProductListingType[]>([])

    const [ searchParams, setSearchParams ] = useSearchParams();

    //metadata to show.
    const [ limit, setLimit ] = useState(12);
    const [ page, setPage ] = useState(1);
    const [ totalProductsCount, setTotalProductsCount ] = useState(0);


    useEffect(() => {
        window.addEventListener("resize", handleWindowResize);

        return () => window.removeEventListener("resize", handleWindowResize);
    }, [])

    const fetchDataWithFilters = async () => {
        const sort_filter = searchParams.get("sort") ?? "";
        const sizes_filter = searchParams.getAll ? searchParams.getAll("size") : (searchParams.get("size") ? [ searchParams.get("size") ] : []);
        const min_filter = searchParams.get("min") ?? "";
        const max_filter = searchParams.get("max") ?? "";
        const search_query = searchParams.get("search") ?? "";

        const sortParam = sort_filter !== "" ? `&sort=${sort_filter}` : "";
        let sizeParam = ""
        if (sizes_filter.length > 0)
            sizes_filter.forEach(filter => sizeParam.concat(`&size=${filter}`))
        const minParam = min_filter !== "" ? `&min=${min_filter}` : "";
        const maxParam = max_filter !== "" ? `&max=${max_filter}` : "";
        const srchParam = search_query !== "" ? `&search=${search_query}` : "";

        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/get-products-with-filters?${srchParam}&limit=12&page=${searchParams.get("page") || 1}${sortParam}${sizeParam}${minParam}${maxParam}`);
        if (!response.ok) {
            throw new Error('Network response was not ok')
        }
        const filteredData = await response.json();
        return filteredData;
    }


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

    const { isPending, error, data, isSuccess } = useQuery({
        queryKey: [ 'products' ],
        queryFn: fetchDataWithFilters
    })
    // const products: Product_ProductListingType[] = data?.data
    useEffect(() => {
        if (isSuccess)
            setProducts(data?.data)
    }, [ isSuccess ])


    // Update pagination/metadata when query `data` changes (do not call setters during render)
    useEffect(() => {
        if (data?.meta?.limit) setLimit(data.meta.limit);
        if (data?.meta?.page) setPage(data.meta.page);
        if (data?.meta?.totalProducts) setTotalProductsCount(data.meta.totalProducts);
    }, [ data ]);



    const handleFilterUpdate = async () => {
        const filteredData = await fetchDataWithFilters();
        if (filteredData?.success) {
            setProducts(filteredData?.data)
            if (filteredData?.meta?.limit) setLimit(filteredData?.meta?.limit)
            if (filteredData?.meta?.page) setPage(filteredData?.meta?.page)
            if (filteredData?.meta?.totalProducts) setTotalProductsCount(filteredData?.meta?.totalProducts)
        } else {
            console.error("Error while fetching data!!")
        }
    }

    const handleSearch = async (e: react.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsSearching(true);
        setSearchParams(searchParams => {
            searchParams.delete("page");
            searchParams.delete("search");
            if (searchQuery !== "")
                searchParams.append("search", searchQuery);
            return searchParams;
        });

    }

    useEffect(() => {
        const tempFunc = async () => {
            const filteredData = await fetchDataWithFilters();
            console.log(filteredData)
            if (filteredData?.success) {
                setProducts(filteredData?.data)
                if (filteredData?.meta?.limit) setLimit(filteredData?.meta?.limit)
                if (filteredData?.meta?.page) setPage(filteredData?.meta?.page)
                if (filteredData?.meta?.totalProducts) setTotalProductsCount(filteredData?.meta?.totalProducts)
            } else {
                console.error("Error while fetching data!!")
            }

            setIsSearching(false);
        }
        if (isSearching)
            tempFunc();

        setSearchQuery(searchParams.get("search") || "")
    }, [ searchParams ])


    if (error)
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
                            <h2 className="pl-2 md:pl-0 text-xl md:text-2xl font-semibold text-foreground mt-4 sm:mt-5 mb-2">You Might Like These</h2>
                            <p className="pl-2 md:pl-0 text-xs md:text-sm text-foreground/80 my-2">{`Showing ${totalProductsCount > limit ? limit : totalProductsCount} out of ${totalProductsCount} items`}</p>
                        </div>
                        <div onClick={() => setShowFilters(!showFilters)} className="flex pr-4 w-fit xl:hidden gap-2 text-foreground/80 items-center">
                            <Filter size={20} />
                            <p className=" text-sm">{showFilters ? "Hide Filters" : "Filters"}</p>
                        </div>


                    </div>

                    {/* Tees Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4 lg:gap-6 md:translate-x-4 xl:translate-x-0">
                        {isPending ?
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