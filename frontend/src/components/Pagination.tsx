import { useState } from 'react'
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { useSearchParams } from 'react-router'

export default function FunctionalPagination({ limit, totalProducts, currentPage = 1 }: { limit: number, totalProducts: number, currentPage: number }) {
    const [ page, setPage ] = useState(currentPage)
    const [ _searchParams, setSearchParams ] = useSearchParams()
    const totalPages = Math.ceil(totalProducts / limit)


    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage)
            // navigate(`?page=${newPage}`);
            setSearchParams(prev => ({ ...prev, page: newPage }))
            // Here you would typically fetch new data
            // fetchProducts(newPage, limit)
        }
    }

    const getPageNumbers = () => {
        const pages: (number | string)[] = []

        if (totalPages <= 3) {
            // Show all pages if 3 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else if (totalPages <= 7) {
            // Show all pages if 7 or less (no ellipsis needed)
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Complex pagination with ellipsis
            if (page <= 3) {
                // Near start: 1 2 3 4 ... last
                pages.push(1, 2, 3, 4, 'ellipsis', totalPages)
            } else if (page >= totalPages - 2) {
                // Near end: 1 ... last-3 last-2 last-1 last
                pages.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
            } else {
                // Middle: 1 ... page-1 page page+1 ... last
                pages.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages)
            }
        }

        return pages
    }

    if (limit >= totalProducts) {
        return null // Don't show pagination if all items fit on one page
    }

    const pageNumbers = getPageNumbers()

    return (
        <Pagination className="mt-10 sm:mt-12 md:mt-16">
            <PaginationContent className="flex-wrap gap-1 sm:gap-0">
                <PaginationItem>
                    <PaginationPrevious
                        // href="#"
                        className={`text-xs sm:text-sm ${page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                        onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page - 1)
                        }}
                    />
                </PaginationItem>

                {pageNumbers.map((pageNum, index) => (
                    pageNum === 'ellipsis' ? (
                        <PaginationItem key={`ellipsis-${index}`} className="hidden sm:block">
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={pageNum}>
                            <PaginationLink
                                // href={`?page=${pageNum}`}
                                isActive={pageNum === page}
                                className="text-xs sm:text-sm cursor-pointer"
                                onClick={(e) => {
                                    e.preventDefault()
                                    handlePageChange(pageNum as number)
                                }}
                            >
                                {pageNum}
                            </PaginationLink>
                        </PaginationItem>
                    )
                ))}

                <PaginationItem>
                    <PaginationNext
                        // href="#"
                        className={`text-xs sm:text-sm ${page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
                        onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page + 1)
                        }}
                    />
                </PaginationItem>
            </PaginationContent>

            {/* Debug info - remove in production */}
            <div className="text-center mt-4 text-sm text-gray-600">
                Page {page} of {totalPages} | Showing {Math.min(limit * page, totalProducts)} of {totalProducts} products
            </div>
        </Pagination>
    )
}