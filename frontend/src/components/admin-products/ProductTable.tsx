"use client"

import { Edit2, Eye, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"

interface Product {
    id: number
    name: string
    image: string
    price: number
    status: "active" | "inactive"
    sold: number
    rating: number
}

interface ProductTableProps {
    products: Product[]
    onEdit: (id: number) => void
    onDelete: (id: number) => void
    onDetails: (id: number) => void
}

export default function ProductTable({ products, onEdit, onDelete, onDetails }: ProductTableProps) {
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
                    {products.map((product) => (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                            {/* Product Info */}
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                        <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-4">
                                <p className="text-sm font-semibold text-foreground">${product.price.toFixed(2)}</p>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-4">
                                <Badge
                                    variant={product.status === "active" ? "default" : "secondary"}
                                    className={product.status === "active" ? "bg-green-500/20 text-green-700 dark:text-green-400" : ""}
                                >
                                    {product.status === "active" ? "Active" : "Inactive"}
                                </Badge>
                            </td>

                            {/* Sold */}
                            <td className="px-4 py-4 text-center">
                                <p className="text-sm font-medium text-foreground">{product.sold}</p>
                            </td>

                            {/* Rating */}
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-1">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <p className="text-sm font-medium text-foreground">{product.rating}</p>
                                </div>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    {/* Desktop Actions */}
                                    <div className="hidden sm:flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDetails(product.id)}
                                            title="View details"
                                            className="h-8 w-8 p-0 hover:bg-muted"
                                        >
                                            <Eye size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onEdit(product.id)}
                                            title="Edit product"
                                            className="h-8 w-8 p-0 hover:bg-muted"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onDelete(product.id)}
                                            title="Delete product"
                                            className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="sm:hidden">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => onDetails(product.id)}>
                                                    <Eye size={16} className="mr-2" />
                                                    Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onEdit(product.id)}>
                                                    <Edit2 size={16} className="mr-2" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(product.id)}
                                                    className="text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 size={16} className="mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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
