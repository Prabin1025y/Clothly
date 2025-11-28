"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CheckoutProgressBar from "@/components/checkout/ProgressBar"
import CartItemsStep from "@/components/checkout/steps/CartItems"
import ShippingStep from "@/components/checkout/steps/Shipping"
import PaymentStep from "@/components/checkout/steps/Payment"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CartItemType } from "@/type/cart"
// import CompleteStep from "@/components/checkout/steps/complete"

const STEPS = [
    { id: 1, label: "Manage Cart" },
    { id: 2, label: "Shipping Information" },
    { id: 3, label: "Payment" },
    // { id: 4, label: "Complete" },
]

export default function CheckoutPage() {
    const [ currentStep, setCurrentStep ] = useState(1)
    const [ promoCode, setPromoCode ] = useState("")

    // Mock data
    const cartItems = [
        { id: 1, name: "Classic Black Tee", price: 1399, quantity: 2 },
        { id: 2, name: "Classic Black Tee", price: 1399, quantity: 1 },
        { id: 3, name: "Classic Black Tee", price: 1399, quantity: 2 },
        { id: 4, name: "Classic Black Tee", price: 1399, quantity: 1 },
        { id: 5, name: "Classic Black Tee", price: 1399, quantity: 2 },
        { id: 6, name: "Classic Black Tee", price: 1399, quantity: 1 },
    ]

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const delivery = 0
    const total = subtotal + delivery

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <CartItemsStep isFetching={isFetching} items={data} />
            case 2:
                return <ShippingStep />
            case 3:
                return <PaymentStep />
            default:
                return null
        }
    }

    const queryResponse = useQuery({
        queryKey: [ "cartitems" ],
        staleTime: 24 * 60 * 60 * 1000,
        queryFn: async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/carts/get-cart-items`);
                const result = await response.json();
                console.log(result)
                if (result?.success && Array.isArray(result?.data?.[ 0 ]?.items))
                    return result?.data?.[ 0 ]?.items;
                else
                    throw new Error("Response not ok");
            } catch (error) {
                toast.error("Failed to fetch your cart!!")
                console.error(error);
            }
        }
    })

    const { isFetching, refetch } = queryResponse;

    const data: CartItemType[] = queryResponse.data;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-12">
                    <CheckoutProgressBar currentStep={currentStep} steps={STEPS} />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Content Area */}
                    <div className="lg:col-span-2">
                        <div className="mb-8">
                            {currentStep === 1 && <h2 className="text-2xl font-bold mb-6">Cart Items</h2>}
                            {currentStep === 2 && <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>}
                            {currentStep === 3 && <h2 className="text-2xl font-bold mb-6">Payment Method</h2>}
                            {currentStep === 4 && <h2 className="text-2xl font-bold mb-6">Order Complete</h2>}
                        </div>
                        {renderStepContent()}
                    </div>

                    {/* Right Sidebar - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-8">
                            <h3 className="text-xl font-bold mb-6">Total</h3>

                            {/* Price Details */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-border">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Sub Total</span>
                                    <span className="font-medium">Rs. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="font-medium">Rs. {delivery}</span>
                                </div>
                            </div>

                            {/* Promo Code */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium mb-3">Promo Code</label>
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Enter Promo Code"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        className="flex-1 text-sm"
                                    />
                                    <Button variant="outline" className="px-4 bg-transparent">
                                        Apply
                                    </Button>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Button
                                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-6 mb-3"
                                disabled={currentStep !== 4}
                            >
                                CHECKOUT
                            </Button>
                            <p className="text-xs text-red-500 text-center mb-6">* Shipping address not confirmed</p>

                            {/* Payment Methods */}
                            <div>
                                <label className="block text-sm font-bold mb-3">WE ACCEPT</label>
                                <div className="flex gap-2 flex-wrap">
                                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded border border-border text-xs font-bold">
                                        Sewa
                                    </div>
                                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded border border-border text-xs font-bold">
                                        easypaisa
                                    </div>
                                    <div className="flex items-center justify-center w-10 h-10 bg-muted rounded border border-border text-xs font-bold">
                                        Imamdi
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-12">
                    <Button
                        onClick={handlePrevious}
                        disabled={currentStep === 1}
                        variant="outline"
                        className="px-8 py-6 bg-transparent"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={handleNext}
                        disabled={currentStep === STEPS.length}
                        className="px-8 py-6 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
