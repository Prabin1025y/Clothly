"use client"

import { useState, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductFilters from "@/components/admin-products/ProductFilters"
import ProductTable from "@/components/admin-products/ProductTable"
import type { FilterOptions } from "@/type/adminProducts"

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
    const [ showAddModal, setShowAddModal ] = useState(false)
    const [ filters, setFilters ] = useState<FilterOptions>({
        searchQuery: "",
        status: "all",
        priceRange: [ 0, 500 ],
        sortBy: "name",
        sortOrder: "asc",
    })

    const filteredProducts = useMemo(() => {
        let result = [ ...products ]

        // Search filter
        if (filters.searchQuery) {
            result = result.filter((p) => p.name.toLowerCase().includes(filters.searchQuery.toLowerCase()))
        }

        // Status filter
        if (filters.status !== "all") {
            result = result.filter((p) => p.status === filters.status)
        }

        // Price range filter
        result = result.filter((p) => p.price >= filters.priceRange[ 0 ] && p.price <= filters.priceRange[ 1 ])

        // Sorting
        result.sort((a, b) => {
            let compareValue = 0

            switch (filters.sortBy) {
                case "name":
                    compareValue = a.name.localeCompare(b.name)
                    break
                case "price":
                    compareValue = a.price - b.price
                    break
                case "date":
                    compareValue = (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0)
                    break
                case "sold":
                    compareValue = a.sold - b.sold
                    break
                case "rating":
                    compareValue = a.rating - b.rating
                    break
            }

            return filters.sortOrder === "asc" ? compareValue : -compareValue
        })

        return result
    }, [ products, filters ])

    const handleDelete = (id: number) => {
        setProducts(products.filter((p) => p.id !== id))
    }

    const handleEdit = (id: number) => {
        console.log("Edit product:", id)
    }

    const handleDetails = (id: number) => {
        console.log("View details:", id)
    }

    const handleAddProduct = (newProduct: Omit<Product, "id" | "createdAt">) => {
        const product: Product = {
            ...newProduct,
            id: Math.max(...products.map((p) => p.id), 0) + 1,
            createdAt: new Date(),
        }
        setProducts([ ...products, product ])
        setShowAddModal(false)
    }

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
                        <Button onClick={() => setShowAddModal(true)} className="gap-2 bg-primary hover:bg-primary/90">
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

                {filteredProducts.length === 0 ? (
                    <div className="rounded-lg border border-border bg-card p-12 text-center">
                        <p className="text-muted-foreground">No products found. Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="mt-6 overflow-hidden rounded-lg border border-border bg-card">
                        <ProductTable
                            products={filteredProducts}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onDetails={handleDetails}
                        />
                    </div>
                )}
            </div>

            {/* Add Product Modal */}
            {/* <AddProductModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddProduct} /> */}
        </div>
    )
}
