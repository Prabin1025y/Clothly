import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { CartItemType } from "@/type/cart"
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";
import { ProductEditOverlay } from "../EditOverlay";
import { useState } from "react";


interface CartItemsStepProps {
    items: CartItemType[];
    isFetching: boolean;
}


export default function CartItemsStep({ items, isFetching }: CartItemsStepProps) {

    const [ showEditOverlay, setShowEditOverlay ] = useState(false);
    const [ currentProductSlug, setCurrentProductSlug ] = useState("");

    const queryClient = useQueryClient()

    const handleDeleteItem = async (variantId: number) => {
        if (variantId === -1)
            return toast.error("No such product in your cart!!");
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/delete-cart-item/${variantId}`, {
                method: "DELETE",
                credentials: "include"
            })
            const result = await response.json();
            if (!response.ok || result?.data?.length === 0) {
                return toast.error("Something went wrong!!");
            }
            toast.success("Item removed from cart!");
            queryClient.invalidateQueries({ queryKey: [ 'cartitems' ] })
            // console.log(result);
        } catch (error) {
            toast.error("Something went wrong!!");
            console.log(error);
        }
    }

    const handleEditButtonClicked = async (slug: string) => {
        setShowEditOverlay(true);
        setCurrentProductSlug(slug ?? "");
    }

    if (!items && isFetching)
        return <div>Loading Cart...</div>
    if (items?.length === 0)
        return <Empty >
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <ShoppingCart />
                </EmptyMedia>
                <EmptyTitle>No Product Yet</EmptyTitle>
                <EmptyDescription>
                    You haven&apos;t added any product to your cart. Shop now to own some premium tees.
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    <Link to={"/shop"}>
                        <Button className="cursor-pointer">Shop Now</Button>
                    </Link>
                </div>
            </EmptyContent>
        </Empty>
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <ProductEditOverlay isOpen={showEditOverlay} onClose={() => setShowEditOverlay(false)} slug={currentProductSlug} />

            {items?.map((item, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* Product Image */}
                    <div className="aspect-square w-full overflow-hidden rounded-t-md bg-gradient-to-br from-muted to-muted/50">
                        <img
                            src={item?.product_image_url}
                            alt={item?.product_image_alt_text ?? 'Product image'}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        // onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/images/placeholder.png'; }}
                        />
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{item.product_name}</h3>

                        <div className="text-xs text-muted-foreground space-y-1 mb-3">
                            <p>Price: Rs. {item.price_snapshot.toLocaleString()}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p className="font-semibold text-foreground">
                                Total: Rs. {(item.price_snapshot * item.quantity).toString().toLocaleString()}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <Button onClick={() => handleEditButtonClicked(item.product_slug)} variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteItem(Number(item.variant_id) ?? -1)}
                                className="flex-1 text-xs text-red-600 hover:text-red-700 bg-transparent"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                </Card>
                // <CartCard isHovered={true} data={demodata} id={item.id} key={item.id} />
            ))}
        </div>
    )
}
