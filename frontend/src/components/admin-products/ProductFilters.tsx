"use client"

import { Filter, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, type FormEvent } from "react"

interface FilterOptions {
    searchQuery: string
    status: "all" | "active" | "inactive"
    priceRange: [ number, number ]
    sortBy: "name" | "price" | "date" | "sold" | "rating"
    sortOrder: "asc" | "desc"
}

interface ProductFiltersProps {
    filters: FilterOptions
    onFiltersChange: (filters: FilterOptions) => void
}

export default function ProductFilters({ filters, onFiltersChange }: ProductFiltersProps) {
    const [ filtersCopy, setFiltersCopy ] = useState<FilterOptions>(filters)
    const handleSearchChange = (value: string) => {
        if (value === "" && filters.searchQuery !== "")
            onFiltersChange({ ...filtersCopy, searchQuery: "" });
        setFiltersCopy({ ...filtersCopy, searchQuery: value })
    }

    const handleStatusChange = (value: string) => {
        onFiltersChange({ ...filters, status: value as FilterOptions[ "status" ] })
    }

    const handleSortByChange = (value: string) => {
        onFiltersChange({ ...filters, sortBy: value as FilterOptions[ "sortBy" ] })
    }

    const handleSortOrderChange = (value: string) => {
        onFiltersChange({ ...filters, sortOrder: value as "asc" | "desc" })
    }

    const handlePriceRangeChange = (type: "min" | "max", value: string) => {
        const numValue = Number.parseFloat(value) || 0
        const [ min, max ] = filtersCopy.priceRange

        if (type === "min") {
            setFiltersCopy({ ...filtersCopy, priceRange: [ numValue, max ] })
        } else {
            setFiltersCopy({ ...filtersCopy, priceRange: [ min, numValue === 0 ? Infinity : numValue ] })
        }
    }

    const handleClearFilters = () => {
        onFiltersChange({
            searchQuery: "",
            status: "all",
            priceRange: [ 0, Infinity ],
            sortBy: "name",
            sortOrder: "asc",
        })
    }

    const handleApplyFIlters = (e?: FormEvent<HTMLFormElement>) => {
        if (e)
            e.preventDefault()

        onFiltersChange(filtersCopy);
    }

    const hasActiveFilters =
        filters.searchQuery !== "" ||
        filters.status !== "all" ||
        filters.priceRange[ 0 ] !== 0 ||
        filters.priceRange[ 1 ] !== 500 ||
        filters.sortBy !== "name" ||
        filters.sortOrder !== "asc"

    return (
        <div className="space-y-4 rounded-lg border border-border bg-card p-4">
            {/* Search Bar */}
            <form onSubmit={handleApplyFIlters} className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={filtersCopy.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                />
            </form>

            {/* Filters and Sort */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Status Filter */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                    <Select value={filters.status} onValueChange={handleStatusChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Price Range Min */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Min Price</label>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filtersCopy.priceRange[ 0 ]}
                        onChange={(e) => handlePriceRangeChange("min", e.target.value)}
                        min="0"
                    />
                </div>

                {/* Price Range Max */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Max Price</label>
                    <Input
                        type="number"
                        placeholder="Max"
                        value={filtersCopy.priceRange[ 1 ]}
                        onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                        min="0"
                    />
                </div>

                {/* Sort By */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Sort By</label>
                    <Select value={filters.sortBy} onValueChange={handleSortByChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="price">Price</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="rating">Rating</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort Order */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Order</label>
                    <Select value={filters.sortOrder} onValueChange={handleSortOrderChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="asc">Ascending</SelectItem>
                            <SelectItem value="desc">Descending</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <div className="flex justify-end gap-4">
                    <Button size="sm" onClick={() => handleApplyFIlters()} className="gap-2 cursor-pointer">
                        <Filter size={16} />
                        Apply Filters
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2 bg-transparent cursor-pointer">
                        <X size={16} />
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
