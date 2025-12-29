import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import type { CartItemType } from "@/type/cart"
import { useQueryClient } from "@tanstack/react-query";
import { AlertOctagon, Loader2, ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { ProductEditOverlay } from "../EditOverlay";
import { useState } from "react";
import { useDeleteCartItems } from "@/hooks/useCartItems";


interface CartItemsStepProps {
    cartItems: CartItemType[];
    isFetching: boolean;
    isLoading: boolean;
    isError: boolean;
}

interface CurrentCartItemType {
    id: number;
    variantId: number;
}

export default function CartItemsStep({ cartItems, isFetching, isLoading, isError }: CartItemsStepProps) {

    const [ showEditOverlay, setShowEditOverlay ] = useState(false);
    const [ currentCartItem, setCurrentCartItem ] = useState<CurrentCartItemType>({} as CurrentCartItemType);

    const queryClient = useQueryClient()
    const deleteCartItem = useDeleteCartItems();
    // const { setCartItemsState, cartItemsState } = useCartItemStore();

    const handleDeleteItem = async (variantId: number) => {
        await deleteCartItem.mutateAsync(variantId)
    }

    const handleEditButtonClicked = async (cartItemId: number, variantId: number) => {
        setShowEditOverlay(true);
        console.log("handle edit button clicked: ", cartItemId);
        setCurrentCartItem({ id: cartItemId, variantId: variantId });
    }

    if (isLoading)
        return <div>Loading Cart...</div>

    if (isError)
        return <Empty >
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <AlertOctagon color="red" />
                </EmptyMedia>
                <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                <EmptyDescription className="text-red-400">
                    An error occured while getting your cart items. Please try again!!
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                        <Loader2 className="animate-spin" /> Retrying...
                    </Button> : <Button
                        className="cursor-pointer bg-red-500"
                        onClick={() => queryClient.invalidateQueries({ queryKey: [ "cart-items" ] })}
                    >
                        Retry
                    </Button>}
                </div>
            </EmptyContent>
        </Empty>

    if (cartItems?.length === 0 && !isFetching)
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
            <ProductEditOverlay isOpen={showEditOverlay} onClose={() => setShowEditOverlay(false)} cartItemId={currentCartItem.id} variantId={currentCartItem.variantId} />

            {cartItems?.map((item, idx) => (
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
                            <Button
                                onClick={() => handleEditButtonClicked(item.cart_item_id, item.variant_id)}
                                variant="outline"
                                // disabled={cartItemsState !== "none"}
                                size="sm"
                                className="flex-1 text-xs bg-transparent"
                            >
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                // disabled={cartItemsState !== "none"}
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
