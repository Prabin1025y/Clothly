"use client"

import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    const handleSearchChange = (value: string) => {
        onFiltersChange({ ...filters, searchQuery: value })
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
        const [ min, max ] = filters.priceRange

        if (type === "min") {
            onFiltersChange({ ...filters, priceRange: [ numValue, max ] })
        } else {
            onFiltersChange({ ...filters, priceRange: [ min, numValue ] })
        }
    }

    const handleClearFilters = () => {
        onFiltersChange({
            searchQuery: "",
            status: "all",
            priceRange: [ 0, 500 ],
            sortBy: "name",
            sortOrder: "asc",
        })
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
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search products..."
                    value={filters.searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Filters and Sort */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {/* Status Filter */}
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

                {/* Price Range Min */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-muted-foreground">Min Price</label>
                    <Input
                        type="number"
                        placeholder="Min"
                        value={filters.priceRange[ 0 ]}
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
                        value={filters.priceRange[ 1 ]}
                        onChange={(e) => handlePriceRangeChange("max", e.target.value)}
                        min="0"
                    />
                </div>

                {/* Sort By */}
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

                {/* Sort Order */}
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

            {/* Clear Filters Button */}
            {hasActiveFilters && (
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={handleClearFilters} className="gap-2 bg-transparent">
                        <X size={16} />
                        Clear Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
