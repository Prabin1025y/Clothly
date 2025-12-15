"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import CheckoutProgressBar from "@/components/checkout/ProgressBar"
import CartItemsStep from "@/components/checkout/steps/CartItems"
import ShippingStep from "@/components/checkout/steps/Shipping"
import PaymentStep from "@/components/checkout/steps/Payment"
import type { CartItemType } from "@/type/cart"
import { useCartItemStore } from "@/zustand/cartStore"
import { useCartItems } from "@/hooks/useCartItems"

const STEPS = [
    { id: 1, label: "Manage Cart" },
    { id: 2, label: "Shipping Information" },
    { id: 3, label: "Payment" },
]

export default function CheckoutPage() {
    const [ currentStep, setCurrentStep ] = useState(1)


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
                return <CartItemsStep
                    isFetching={isFetching}
                    isLoading={isLoading}
                    isError={isError}
                    // isPlaceholderData={isPlaceholderData}
                    cartItems={cartItems}
                />
            case 2:
                return <ShippingStep />
            case 3:
                return <PaymentStep totalPrice={Number(total_price)} />
            default:
                return null
        }
    }

    const { cartItemsState } = useCartItemStore();

    const {
        data,
        isLoading,
        isError,
        isFetching,
        // isPlaceholderData
    } = useCartItems();


    const cartItems: CartItemType[] = data?.data?.items || []
    // console.log(cartItems)
    const total_price = data?.data?.total_price || "0.00"

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

                        <div className="mb-8 flex items-center">
                            {currentStep === 1 && cartItems.length !== 0 && <h2 className="text-2xl font-bold mb-6 fkex">Cart Items
                                {!isLoading && isFetching && <span className="text-base font-normal text-sky-600 ml-3">↻ updating...</span>}
                            </h2>}
                            {currentStep === 2 && <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>}
                            {currentStep === 3 && <h2 className="text-2xl font-bold mb-6">Payment Method</h2>}
                            {currentStep === 4 && <h2 className="text-2xl font-bold mb-6">Order Complete</h2>}
                            {/* <span>updating</span> */}
                        </div>
                        {renderStepContent()}
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
                                disabled={currentStep === STEPS.length || cartItems.length === 0}
                                className="px-8 py-6 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                            >
                                Next
                            </Button>
                        </div>
                    </div>

                    {/* Right Sidebar - Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="p-6 sticky top-8 space-y-6 gap-1 border-none shadow-none">
                            <h3 className="text-2xl font-semibold tracking-tight">Total</h3>

                            {/* Price Details */}
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium text-base">
                                        Rs. {total_price}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery</span>
                                    <span className="font-medium text-base">Rs. {cartItems.length === 0 ? 0.00 : 100.00}</span>
                                </div>

                                {/* Total Amount */}
                                <div className="flex justify-between text-sm pt-2 border-t border-border">
                                    <span className="font-semibold">Total Amount</span>
                                    <span className="font-bold text-lg">
                                        Rs.{" "}
                                        {data
                                            ? (Number(total_price) + 100).toLocaleString()
                                            : "..."}
                                    </span>
                                </div>
                            </div>


                            {/* Checkout Button */}
                            <p className="text-xs text-red-500 mb-0">
                                * Shipping address not confirmed
                            </p>
                            <Button
                                className="w-full mt-0 bg-amber-500 hover:bg-amber-600 text-black font-semibold py-6 text-lg"
                                disabled={currentStep !== 4}
                            >
                                CHECKOUT
                                {cartItemsState}
                            </Button>


                            {/* Payment Methods */}
                            {/* <div>
                                <label className="block text-sm font-semibold mb-3">WE ACCEPT</label>
                                <div className="flex gap-3 flex-wrap">
                                    {[ "Sewa", "easypaisa", "Imamdi" ].map((m, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-center w-12 h-12 bg-muted rounded-xl border border-border text-xs font-bold"
                                        >
                                            {m}
                                        </div>
                                    ))}
                                </div>
                            </div> */}
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    )
}
