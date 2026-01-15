import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { useAdminProducts, useAdminProductColors, useAdminProductSizes } from "@/hooks/useAdminProducts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import FunctionalPagination from "@/components/Pagination";

export default function AdminProductsTable() {
    const [searchParams, setSearchParams] = useSearchParams();
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 20;
    const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
    const [expandedColors, setExpandedColors] = useState<Map<number, string>>(new Map()); // productId -> color
    const [selectedSizes, setSelectedSizes] = useState<Map<string, string>>(new Map()); // "productId-color" -> size

    const { data, isLoading, isError } = useAdminProducts(page, limit);

    const toggleProduct = (productId: number) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
            // Also collapse colors for this product
            const newColors = new Map(expandedColors);
            Array.from(expandedColors.keys())
                .filter(id => id === productId)
                .forEach(id => newColors.delete(id));
            setExpandedColors(newColors);
        } else {
            newExpanded.add(productId);
        }
        setExpandedProducts(newExpanded);
    };

    const toggleColor = (productId: number, color: string) => {
        const key = `${productId}-${color}`;
        const newColors = new Map(expandedColors);
        if (newColors.get(productId) === color) {
            newColors.delete(productId);
        } else {
            newColors.set(productId, color);
        }
        setExpandedColors(newColors);
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    if (isError || !data) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-destructive">
                    Failed to load products. Please try again.
                </CardContent>
            </Card>
        );
    }

    const products = data.data;
    const meta = data.meta;

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Products Management
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left p-3 font-semibold text-sm">Product</th>
                                    <th className="text-left p-3 font-semibold text-sm">SKU</th>
                                    <th className="text-left p-3 font-semibold text-sm">Status</th>
                                    <th className="text-left p-3 font-semibold text-sm">Price</th>
                                    <th className="text-left p-3 font-semibold text-sm">Sold</th>
                                    <th className="text-left p-3 font-semibold text-sm">Rating</th>
                                    <th className="text-left p-3 font-semibold text-sm w-20">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            No products found
                                        </td>
                                    </tr>
                                ) : (
                                    products.map((product) => {
                                        const isExpanded = expandedProducts.has(product.id);
                                        const selectedColor = expandedColors.get(product.id);

                                        return (
                                            <>
                                                <tr
                                                    key={product.id}
                                                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            {product.image_url ? (
                                                                <img
                                                                    src={product.image_url}
                                                                    alt={product.image_alt_text || product.name}
                                                                    className="h-12 w-12 object-cover rounded border"
                                                                />
                                                            ) : (
                                                                <div className="h-12 w-12 bg-muted rounded border flex items-center justify-center">
                                                                    <Package className="h-6 w-6 text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <div className="font-medium">{product.name}</div>
                                                                {product.short_description && (
                                                                    <div className="text-xs text-muted-foreground line-clamp-1">
                                                                        {product.short_description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-sm text-muted-foreground">{product.sku}</td>
                                                    <td className="p-3">
                                                        <span
                                                            className={cn(
                                                                "px-2 py-1 rounded-full text-xs font-medium",
                                                                product.status === "active"
                                                                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                                            )}
                                                        >
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="text-sm">
                                                            <span className="font-medium">Rs. {product.current_price}</span>
                                                            {product.original_price !== product.current_price && (
                                                                <span className="text-xs text-muted-foreground line-through ml-1">
                                                                    Rs. {product.original_price}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-sm">{product.sold_count}</td>
                                                    <td className="p-3 text-sm">
                                                        {product.average_rating ? (
                                                            <span>{parseFloat(product.average_rating).toFixed(1)} ⭐</span>
                                                        ) : (
                                                            <span className="text-muted-foreground">No rating</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => toggleProduct(product.id)}
                                                            className="h-8 w-8 p-0"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    </td>
                                                </tr>
                                                {isExpanded && (
                                                    <ProductColorsRow
                                                        productId={product.id}
                                                        selectedColor={selectedColor}
                                                        onColorSelect={(color) => toggleColor(product.id, color)}
                                                        onSizeSelect={(color, size) =>
                                                            setSelectedSizes(new Map(selectedSizes.set(`${product.id}-${color}`, size)))
                                                        }
                                                        selectedSize={selectedSizes.get(`${product.id}-${selectedColor || ""}`) || ""}
                                                    />
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {meta.totalPages > 1 && (
                <div className="mt-4">
                    <FunctionalPagination
                        limit={limit}
                        totalProducts={meta.totalProducts}
                        currentPage={page}
                    />
                </div>
            )}
        </div>
    );
}

interface ProductColorsRowProps {
    productId: number;
    selectedColor: string | undefined;
    onColorSelect: (color: string) => void;
    onSizeSelect: (color: string, size: string) => void;
    selectedSize: string;
}

function ProductColorsRow({ productId, selectedColor, onColorSelect, onSizeSelect, selectedSize }: ProductColorsRowProps) {
    const { data: colorsData, isLoading: colorsLoading } = useAdminProductColors(productId);

    if (colorsLoading) {
        return (
            <tr>
                <td colSpan={7} className="p-4 bg-muted/20">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading colors...
                    </div>
                </td>
            </tr>
        );
    }

    if (!colorsData || colorsData.data.length === 0) {
        return (
            <tr>
                <td colSpan={7} className="p-4 bg-muted/20">
                    <div className="text-sm text-muted-foreground">No color variants available</div>
                </td>
            </tr>
        );
    }

    const colors = colorsData.data;

    return (
        <tr>
            <td colSpan={7} className="p-4 bg-muted/20">
                <div className="space-y-3">
                    <div className="text-sm font-medium mb-2">Color Variants:</div>
                    <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                            <div key={color.color} className="space-y-2">
                                <Button
                                    variant={selectedColor === color.color ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onColorSelect(color.color)}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="h-4 w-4 rounded border"
                                        style={{ backgroundColor: color.hex_color }}
                                    />
                                    <span>{color.color}</span>
                                    <span className="text-xs opacity-70">({color.size_count} sizes)</span>
                                </Button>
                                {selectedColor === color.color && (
                                    <ProductSizesDropdown
                                        productId={productId}
                                        color={color.color}
                                        selectedSize={selectedSize}
                                        onSizeSelect={(size) => onSizeSelect(color.color, size)}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </td>
        </tr>
    );
}

interface ProductSizesDropdownProps {
    productId: number;
    color: string;
    selectedSize: string;
    onSizeSelect: (size: string) => void;
}

function ProductSizesDropdown({ productId, color, selectedSize, onSizeSelect }: ProductSizesDropdownProps) {
    const { data: sizesData, isLoading: sizesLoading } = useAdminProductSizes(productId, color);

    if (sizesLoading) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Loading sizes...
            </div>
        );
    }

    if (!sizesData || sizesData.data.length === 0) {
        return <div className="text-xs text-muted-foreground">No sizes available</div>;
    }

    const sizes = sizesData.data;

    return (
        <Select value={selectedSize} onValueChange={onSizeSelect}>
            <SelectTrigger className="w-full min-w-[150px]">
                <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
                {sizes.map((size) => (
                    <SelectItem key={size.variant_id} value={size.size}>
                        <div className="flex items-center justify-between w-full">
                            <span>{size.size}</span>
                            <span className="text-xs text-muted-foreground ml-4">
                                Stock: {size.available} | Price: Rs. {size.current_price}
                            </span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

