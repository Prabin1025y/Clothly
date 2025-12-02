"use client"

import { useEffect, useState } from "react"
import { X, Minus, Plus } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

interface ProductEditOverlayProps {
    isOpen: boolean
    onClose: () => void
    variantId: number
}

export function ProductEditOverlay({ isOpen, onClose, variantId }: ProductEditOverlayProps) {
    const [ selectedColor, setSelectedColor ] = useState("black")
    const [ selectedSize, setSelectedSize ] = useState("M")
    const [ quantity, setQuantity ] = useState(1)


    const colors = [
        { name: "black", hex: "#000000" },
        { name: "white", hex: "#ffffff" },
        { name: "navy", hex: "#1a1a3e" },
        { name: "sage", hex: "#9ca89a" },
    ]

    const sizes = [ "XS", "S", "M", "L", "XL", "XXL" ]
    const inStock = 12

    const { data } = useQuery({
        queryKey: [ 'edit', variantId ],
        queryFn: async () => {
            try {
                if (variantId === -1) return {}
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/get-cart-info-by-variant-id/${variantId}`, {
                    method: "GET",
                    credentials: "include"
                });
                if (!response.ok) {
                    toast.error("Error occured please try again later!!");
                    throw new Error("Response not ok!");
                }
                const result = await response.json()
                console.log(result)
                return result;
            } catch (error) {
                console.error("Error while fetching product from productId.", error)
            }
        },
        staleTime: 0
    })

    useEffect(() => {
        console.log(data);
    }, [ data ])


    if (!isOpen) return null

    if (variantId === -1)
        return <div>loading...</div>

    return (
        <>
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
                onClick={onClose}
            />

            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
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
                                <h2 className="text-3xl font-medium tracking-wide text-foreground">{variantId}</h2>
                                <p className="text-sm text-muted-foreground">Classic design with modern comfort</p>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-1">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-2xl text-green-600 font-medium">Rs. 89.00</span>
                                    <span className="text-lg text-muted-foreground line-through">Rs. 129.00</span>
                                </div>
                            </div>

                            {/* Stock status */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-foreground">In stock:</span>
                                <span className="text-sm text-primary font-semibold">{inStock} items</span>
                            </div>

                            {/* Color selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Color</label>
                                <div className="flex gap-3 mt-2">
                                    {colors.map((color) => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`w-10 h-10 rounded-full transition-all duration-200 ${selectedColor === color.name
                                                ? "ring-2 ring-offset-2 ring-primary ring-offset-background scale-110"
                                                : "hover:scale-105"
                                                }`}
                                            style={{ backgroundColor: color.hex }}
                                            title={color.name}
                                            aria-label={`Select ${color.name} color`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Size selector */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-foreground">Size</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${selectedSize === size
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-secondary text-foreground hover:bg-muted"
                                                }`}
                                        >
                                            {size}
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
                                    <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
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
                                <button
                                    onClick={() => {
                                        console.log({
                                            color: selectedColor,
                                            size: selectedSize,
                                            quantity,
                                        })
                                        onClose()
                                    }}
                                    className="flex-1 py-3 px-4 rounded-lg bg-accent text-primary-foreground font-medium hover:opacity-90 transition-opacity duration-200"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
