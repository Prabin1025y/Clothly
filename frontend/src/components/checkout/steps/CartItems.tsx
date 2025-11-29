import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { CartItemType } from "@/type/cart"


interface CartItemsStepProps {
    items: CartItemType[];
    isFetching: boolean;
}


export default function CartItemsStep({ items, isFetching }: CartItemsStepProps) {
    if (isFetching)
        return <div>Loading Cart...</div>
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, idx) => (
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
                            <Button variant="outline" size="sm" className="flex-1 text-xs bg-transparent">
                                Edit
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
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
