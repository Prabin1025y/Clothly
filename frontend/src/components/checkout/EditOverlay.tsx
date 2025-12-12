"use client"

import { useEffect, useState } from "react"
import { X, Minus, Plus } from "lucide-react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import ProductDetailsSkeleton from "./EditOverlaySkeleton"
import { Button } from "../ui/button"
import { useCartItemStore } from "@/zustand/cartStore"
import { useCartInfoFromVariantId } from "@/hooks/useCartItems"
import type { GetCartInfoFromVariantIdResponseType_ProductVariant, GetCartInfoFromVariantIdResponseType_SizeVariant } from "@/type/cart"

interface ProductEditOverlayProps {
    isOpen: boolean
    onClose: () => void
    variantId: number
}

export function ProductEditOverlay({ isOpen, onClose, variantId }: ProductEditOverlayProps) {
    const [ selectedColor, setSelectedColor ] = useState<GetCartInfoFromVariantIdResponseType_ProductVariant | null>(null)
    const [ selectedSize, setSelectedSize ] = useState<GetCartInfoFromVariantIdResponseType_SizeVariant | null>(null)
    const [ quantity, setQuantity ] = useState(0)

    const queryClient = useQueryClient();
    const { setCartItemsState } = useCartItemStore();
    const { data, isFetching, isLoading, isError } = useCartInfoFromVariantId(variantId.toString());

    const handleSave = async () => {
        if (!Number.isInteger(Number(quantity))) {
            toast.error("Bad request!!");
            return;
        }

        if (!selectedSize) {
            toast.error("Size is not selected yet!");
            return;
        }

        try {
            setCartItemsState("updating");
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/edit-item-in-cart`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    quantity: quantity,
                    old_variant_id: variantId,
                    variant_id: selectedSize?.variant_id
                })
            })
            const result = await response.json();
            if (result?.success) {
                queryClient.invalidateQueries({ queryKey: [ 'cartitems' ] })
            }
            console.log(result);
            onClose()
        } catch (error) {
            toast.error("Something went wrong!!");
        } finally {
            setCartItemsState("none");
        }
    }

    useEffect(() => {
        setQuantity(Number(data?.cart_quantity))
        setSelectedColor(data?.all_variants?.find(item => item.color == data?.color) ?? null)
    }, [ data ])

    useEffect(() => {
        setSelectedSize(selectedColor?.sizes?.find(item => item.size == data?.size) ?? null)
    }, [ selectedColor ])

    if (!isOpen) return null;


    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {
                    (variantId === -1 || isLoading) ?
                        <ProductDetailsSkeleton onClose={onClose} />
                        :
                        <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-1 right-1 z-10 p-2 hover:bg-secondary rounded-full transition-colors"
                                aria-label="Close overlay"
                            >
                                <X className="w-5 h-5 text-foreground" />
                            </button>

                            {/* Content grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                                {/* Product image section */}
                                <div className="flex items-center justify-center bg-secondary rounded-xl overflow-hidden">
                                    <img
                                        src="/elegant-product-clothing.jpg"
                                        alt="Product"
                                        loading="lazy"
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* Product details section */}
                                <div className="flex flex-col justify-between gap-3">
                                    {/* Header */}
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-medium tracking-wide text-foreground">{data?.name}</h2>
                                        <p className="text-sm text-muted-foreground">Classic design with modern comfort</p>
                                    </div>

                                    {/* Pricing */}
                                    <div className="space-y-1">
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-2xl text-green-600 font-medium">Rs. {data?.current_price}</span>
                                            <span className="text-lg text-muted-foreground line-through">Rs. {data?.original_price}</span>
                                        </div>
                                    </div>

                                    {/* Stock status */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-foreground">In stock:</span>
                                        <span className="text-sm text-primary font-semibold">{selectedSize?.available} items</span>
                                    </div>

                                    {/* Color selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">Color</label>
                                        <div className="flex gap-3 mt-2">
                                            {Array.isArray(data?.all_variants) && data?.all_variants?.map((color) => (
                                                <button
                                                    key={color.color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-10 h-10 rounded-full transition-all duration-200 ${selectedColor?.color === color.color
                                                        ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                                                        : "hover:scale-105"
                                                        }`}
                                                    style={{ backgroundColor: "yellow" }}
                                                    // todo
                                                    title={color.color}
                                                    aria-label={`Select ${color.color} color`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Size selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">Size</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {Array.isArray(selectedColor?.sizes) && selectedColor?.sizes?.map((size) => (
                                                <button
                                                    key={size.size}
                                                    onClick={() => setSelectedSize(size)}
                                                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${selectedSize === size
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-secondary text-foreground hover:bg-muted"
                                                        }`}
                                                >
                                                    {size.size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Quantity selector */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-foreground">Quantity</label>
                                        <div className="flex items-center gap-3 bg-secondary rounded-lg p-2 w-fit">
                                            <button
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                className="p-1 hover:bg-muted rounded transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus className="w-4 h-4 text-foreground" />
                                            </button>
                                            <span className="w-8 text-center font-medium text-foreground">{quantity.toString()}</span>
                                            <button
                                                onClick={() => setQuantity(Math.min(quantity + 1, selectedSize?.available ?? 0))}
                                                className="p-1 hover:bg-muted rounded transition-colors"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-4 h-4 text-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 py-3 px-4 rounded-lg bg-secondary text-foreground font-medium hover:bg-muted transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={!selectedSize || ((selectedSize?.variant_id === Number(data?.variant_id)) && quantity === Number(data?.cart_quantity))}

                                            className="flex-1 py-0 h-full text-inherit px-4 rounded-lg bg-accent text-primary-foreground font-medium hover:opacity-90 transition-opacity duration-200"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                }
            </div>
        </>
    )
}
