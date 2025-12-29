"use client"

import { useEffect, useState } from "react"
import { X, Minus, Plus, AlertOctagon, Loader2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { toast } from "sonner"
import ProductDetailsSkeleton from "./EditOverlaySkeleton"
import { Button } from "../ui/button"
import { useCartItemStore } from "@/zustand/cartStore"
import { useCartItemDetail, useEditCartItem } from "@/hooks/useCartItems";
import type { GetCartItemDetailResponseType_ProductVariant, GetCartItemDetailResponseType_SizeVariant } from "@/type/cart";

interface ProductEditOverlayProps {
    isOpen: boolean
    onClose: () => void
    cartItemId: number
    variantId: number
}

export function ProductEditOverlay({ isOpen, onClose, cartItemId = -1, variantId }: ProductEditOverlayProps) {
    const [ selectedColor, setSelectedColor ] = useState<GetCartItemDetailResponseType_ProductVariant | null>(null)
    const [ selectedSize, setSelectedSize ] = useState<GetCartItemDetailResponseType_SizeVariant | null>(null)
    const [ quantity, setQuantity ] = useState(0)

    const queryClient = useQueryClient();
    const { setCartItemsState } = useCartItemStore();
    // console.log(cartItemId);
    const { data, isFetching, isLoading, isError } = useCartItemDetail(cartItemId.toString());
    const editCartItem = useEditCartItem();

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
            onClose()
            await editCartItem.mutateAsync({
                cart_item_id: cartItemId,
                variant_id: selectedSize.variant_id,
                old_variant_id: variantId,
                color: selectedColor?.color ?? "",
                quantity: quantity,
                size: selectedSize.size,
                current_price: Number(data?.current_price) ?? 0
            })
        } catch (error) {
            console.error("Error occured while updateing cart item:", error)
            toast.error("Something went wrong!!");
        } finally {
            setCartItemsState("none");
        }
    }

    useEffect(() => {
        if (!data) return;

        setQuantity(Number(data?.cart_quantity))
        const nextSelectedColor = data?.all_variants?.find(item => item.color == data?.color) ?? null
        setSelectedColor(nextSelectedColor)

        if (!nextSelectedColor) return;
        setSelectedSize(nextSelectedColor?.sizes?.find(item => item.size == data?.size) ?? null)
    }, [ data ])

    // useEffect(() => {
    //     setSelectedSize(selectedColor?.sizes?.find(item => item.size == data?.size) ?? null)
    // }, [ selectedColor ])

    if (!isOpen) return null;


    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {
                    (() => {

                        if (cartItemId === -1 || isLoading || !data)
                            return <ProductDetailsSkeleton onClose={onClose} />

                        if (isError)
                            return (
                                <Empty className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300" >
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <AlertOctagon color="red" />
                                        </EmptyMedia>
                                        <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                                        <EmptyDescription className="text-red-400">
                                            An error occured while getting info about this item. Please try again!!
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <div className="flex gap-2">
                                            {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                                                <Loader2 className="animate-spin" /> Retrying...
                                            </Button> : <Button
                                                className="cursor-pointer bg-red-500"
                                                onClick={() => queryClient.invalidateQueries({ queryKey: [ "cart-items", "detail", cartItemId.toString() ] })}
                                            >
                                                Retry
                                            </Button>}
                                        </div>
                                    </EmptyContent>
                                </Empty>
                            );


                        return <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden">
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
                                        <p className="text-sm text-muted-foreground">{data?.short_description}</p>
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
                                                    className={`w-10 h-10 border border-black rounded-full transition-all duration-200 ${selectedColor?.color === color.color
                                                        ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                                                        : "hover:scale-105"
                                                        }`}
                                                    style={{ backgroundColor: color.hex_color }}
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

                                            className="flex-1 py-0 h-full px-4 rounded-lg bg-accent text-primary-foreground font-medium hover:opacity-90 transition-opacity duration-200"
                                        >
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    })()

                }
            </div>
        </>
    )
}
