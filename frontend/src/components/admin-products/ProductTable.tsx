import { Edit2, Eye, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import type { AdminProduct } from "@/type/adminProducts"
import { Link } from "react-router"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { useDeleteProductBySlug } from "@/hooks/useAdminProducts"
import { useState } from "react"

interface ProductTableProps {
    products: AdminProduct[]
}

export default function ProductTable({ products }: ProductTableProps) {
    const deleteProduct = useDeleteProductBySlug();
    const [ deleting, setDeleting ] = useState<string[]>([])

    const handleDelete = async (slug: string) => {
        try {
            setDeleting(prev => [ ...prev, slug ])
            await deleteProduct.mutateAsync(slug)
            setDeleting(prev => prev.filter(slg => slg !== slug))
        } catch (error) {
            console.error(error);
        }
    }

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
                        <tr key={product.id} className={`hover:bg-muted/30 transition-colors ${deleting.includes(product.slug) && "opacity-40"}`}>
                            {/* Product Info */}
                            <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                        <img src={product.image_url || "/placeholder.svg"} alt={product.name} className="object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">ID: {product.id}</p>
                                    </div>
                                </div>
                            </td>

                            {/* Price */}
                            <td className="px-4 py-4">
                                <p className="text-sm font-semibold text-foreground">${product.current_price}</p>
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
                                <p className="text-sm font-medium text-foreground">{product.sold_count}</p>
                            </td>

                            {/* Rating */}
                            <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-1">
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                    <p className="text-sm font-medium text-foreground">{product.average_rating}</p>
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
                                            title="View details"
                                            className="h-8 w-8 p-0 hover:bg-muted"
                                        >
                                            <Link
                                                to={deleting.includes(product.slug) ? "#" : `/admin/products/detail/${product.slug}`}
                                                onClick={(e) => deleting.includes(product.slug) && e.preventDefault()}
                                            >
                                                <Eye size={16} />
                                            </Link>
                                        </Button>
                                        <Button

                                            variant="ghost"
                                            asChild
                                            size="sm"
                                            title="Edit product"
                                            className="h-8 w-8 p-0 hover:bg-muted"
                                        >
                                            <Link
                                                to={deleting.includes(product.slug) ? "#" : `/admin/products/edit/${product.slug}`}
                                                onClick={(e) => deleting.includes(product.slug) && e.preventDefault()}
                                            >
                                                <Edit2 size={16} />
                                            </Link>
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    disabled={deleting.includes(product.slug)}
                                                    variant="ghost"
                                                    size="sm"
                                                    title="Delete product"
                                                    className="h-8 w-8 p-0 hover:bg-destructive/20 hover:text-destructive"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-sm">
                                                <DialogHeader>
                                                    <DialogTitle>Edit profile</DialogTitle>
                                                    <DialogDescription>
                                                        Make changes to your profile here. Click save when you&apos;re
                                                        done.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline" >Cancel</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            onClick={() => handleDelete(product.slug)}
                                                            title="Delete product"
                                                            variant={"destructive"}
                                                            className="hover:bg-destructive/20 hover:text-destructive "
                                                        >
                                                            <Trash2 size={16} />
                                                            Delete
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="sm:hidden">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild disabled={deleting.includes(product.slug)}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                                                    <MoreVertical size={16} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild disabled={deleting.includes(product.slug)}>
                                                    <Link
                                                        to={deleting.includes(product.slug) ? "#" : `/admin/products/detail/${product.slug}`}
                                                        onClick={(e) => deleting.includes(product.slug) && e.preventDefault()}
                                                    >
                                                        <Eye size={16} className="mr-2" />
                                                        Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild disabled={deleting.includes(product.slug)}>
                                                    <Link
                                                        to={deleting.includes(product.slug) ? "#" : `/admin/products/edit/${product.slug}`}
                                                        onClick={(e) => deleting.includes(product.slug) && e.preventDefault()}
                                                    >
                                                        <Edit2 size={16} className="mr-2" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    disabled={deleting.includes(product.slug)}
                                                    onClick={() => handleDelete(product.slug)}
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
