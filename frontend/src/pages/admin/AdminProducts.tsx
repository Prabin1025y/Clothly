import { useState } from "react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AlertOctagon, Loader2, PackageOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductFilters from "@/components/admin-products/ProductFilters"
import ProductTable from "@/components/admin-products/ProductTable"
import type { FilterOptions } from "@/type/adminProducts"
import { adminProductsKeys, useAdminProducts } from "@/hooks/useAdminProducts"
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

export default function ProductsPage() {
    const [ filters, setFilters ] = useState<FilterOptions>({
        searchQuery: "",
        status: "all",
        priceRange: [ 0, Infinity ],
        sortBy: "name",
        sortOrder: "asc",
    })

    const { data, isLoading, isFetching, error, isError } = useAdminProducts(1, 12, filters);
    const queryClient = useQueryClient();

    const handleDelete = (id: number) => {
        console.log("Delete product:", id)
    }
    const handleDetails = (id: number) => {
        console.log("View details:", id)
    }

    const filteredProducts = data?.data ?? []


    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">Products</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Manage your product inventory</p>
                        </div>
                        <Link to={"/admin/products/new"}>
                            <Button className="gap-2 bg-primary hover:bg-primary/90">
                                <Plus size={20} />
                                <span className="hidden sm:inline">Add Product</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <ProductFilters filters={filters} onFiltersChange={setFilters} />

                {(
                    () => {
                        if (isLoading || isFetching)
                            return <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4 lg:gap-6 md:translate-x-4 xl:translate-x-0">
                                Loading...
                            </div>

                        if (isError) {
                            console.error(error);
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
                                            onClick={() => queryClient.invalidateQueries({ queryKey: adminProductsKeys.lists() })}
                                        >
                                            Retry
                                        </Button>}
                                    </div>
                                </EmptyContent>
                            </Empty>
                        }

                        if (filteredProducts.length === 0) {
                            return <Empty >
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <PackageOpen color="red" />
                                    </EmptyMedia>
                                    <EmptyTitle className="text-red-500">No products found</EmptyTitle>
                                    <EmptyDescription className="text-red-400">
                                        Try different filter or add a new product
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <div className="flex gap-2">
                                        <Link to={"/admin/products/new"}>
                                            <Button
                                                className="cursor-pointer"
                                            >
                                                Add Product
                                            </Button>
                                        </Link>
                                    </div>
                                </EmptyContent>
                            </Empty>
                        }

                        return <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
                            <ProductTable
                                products={filteredProducts}
                                onDelete={handleDelete}
                                onDetails={handleDetails}
                            />
                        </div>

                    }
                )()}
            </div>

        </div>
    )
}
