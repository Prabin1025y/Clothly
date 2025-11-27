import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
}

interface CartItemsStepProps {
    items: CartItem[]
}


export default function CartItemsStep({ items }: CartItemsStepProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map((item, idx) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {/* Product Image Placeholder */}
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 w-full" />

                    {/* Product Details */}
                    <div className="p-4">
                        <h3 className="font-semibold text-sm mb-2">{item.name}</h3>

                        <div className="text-xs text-muted-foreground space-y-1 mb-3">
                            <p>Price: Rs. {item.price.toLocaleString()}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p className="font-semibold text-foreground">
                                Total: Rs. {(item.price * item.quantity).toLocaleString()}
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
