"use client"

import { useState, useMemo } from "react"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { AlertOctagon, Loader2, PackageOpen, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductFilters from "@/components/admin-products/ProductFilters"
import ProductTable from "@/components/admin-products/ProductTable"
import type { FilterOptions } from "@/type/adminProducts"
import { adminProductsKeys, useAdminProducts } from "@/hooks/useAdminProducts"
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";

interface Product {
    id: number
    name: string
    image: string
    price: number
    status: "active" | "inactive"
    sold: number
    rating: number
    createdAt?: Date
}

const SAMPLE_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Wireless Headphones",
        image: "/wireless-headphones.png",
        price: 99.99,
        status: "active",
        sold: 342,
        rating: 4.5,
        createdAt: new Date("2024-01-15"),
    },
    {
        id: 2,
        name: "USB-C Cable",
        image: "/usb-cable.png",
        price: 12.99,
        status: "active",
        sold: 1205,
        rating: 4.8,
        createdAt: new Date("2024-01-10"),
    },
    {
        id: 3,
        name: "Phone Case",
        image: "/colorful-phone-case-display.png",
        price: 24.99,
        status: "inactive",
        sold: 567,
        rating: 4.2,
        createdAt: new Date("2024-02-20"),
    },
    {
        id: 4,
        name: "Screen Protector",
        image: "/screen-protector.png",
        price: 9.99,
        status: "active",
        sold: 892,
        rating: 4.6,
        createdAt: new Date("2024-01-25"),
    },
    {
        id: 5,
        name: "Laptop Stand",
        image: "/laptop-stand.png",
        price: 49.99,
        status: "active",
        sold: 178,
        rating: 4.7,
        createdAt: new Date("2024-02-01"),
    },
]



export default function ProductsPage() {
    const [ products, setProducts ] = useState<Product[]>(SAMPLE_PRODUCTS)
    // const [ showAddModal, setShowAddModal ] = useState(false)
    const [ filters, setFilters ] = useState<FilterOptions>({
        searchQuery: "",
        status: "all",
        priceRange: [ 0, Infinity ],
        sortBy: "name",
        sortOrder: "asc",
    })

    const { data, isLoading, isFetching, error, isError } = useAdminProducts(1, 12, filters);
    const queryClient = useQueryClient();
    const navigate = useNavigate();


    const handleDelete = (id: number) => {
        setProducts(products.filter((p) => p.id !== id))
    }

    const handleEdit = (id: number) => {
        console.log("Edit product:", id)
    }

    const handleDetails = (id: number) => {
        console.log("View details:", id)
    }

    // const handleAddProduct = (newProduct: Omit<Product, "id" | "createdAt">) => {
    //     const product: Product = {
    //         ...newProduct,
    //         id: Math.max(...products.map((p) => p.id), 0) + 1,
    //         createdAt: new Date(),
    //     }
    //     setProducts([ ...products, product ])
    // }

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
                        <Button className="gap-2 bg-primary hover:bg-primary/90">
                            <Plus size={20} />
                            <span className="hidden sm:inline">Add Product</span>
                            <span className="sm:hidden">Add</span>
                        </Button>
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
                                        <Button
                                            className="cursor-pointer"
                                            onClick={() => navigate("/admin/products/new")}
                                        >
                                            Add Product
                                        </Button>
                                    </div>
                                </EmptyContent>
                            </Empty>
                        }

                        return <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
                            <ProductTable
                                products={filteredProducts}
                                onEdit={handleEdit}
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
