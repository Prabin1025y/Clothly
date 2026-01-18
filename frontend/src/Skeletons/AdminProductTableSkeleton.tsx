import { Skeleton } from "@/components/ui/skeleton"

export default function ProductTableSkeleton() {
    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">Product</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">Price</th>
                        <th className="px-4 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">Sold</th>
                        <th className="px-4 py-4 text-center text-sm font-semibold text-foreground">Rating</th>
                        <th className="px-4 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index} className="hover:bg-muted/30 transition-colors">
                            {/* Product Info Skeleton */}
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-12 w-12 flex-shrink-0 rounded-md" />
                                    <div className="min-w-0 space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                            </td>

                            {/* Price Skeleton */}
                            <td className="px-4 py-4">
                                <Skeleton className="h-4 w-16" />
                            </td>

                            {/* Status Skeleton */}
                            <td className="px-4 py-4">
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </td>

                            {/* Sold Skeleton */}
                            <td className="px-4 py-4">
                                <div className="flex justify-center">
                                    <Skeleton className="h-4 w-12" />
                                </div>
                            </td>

                            {/* Rating Skeleton */}
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-1">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </td>

                            {/* Actions Skeleton */}
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <div className="hidden sm:flex gap-1">
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                    <div className="sm:hidden">
                                        <Skeleton className="h-8 w-8 rounded-md" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}