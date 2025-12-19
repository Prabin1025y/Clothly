import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useGetPaymentSuccess } from "@/hooks/usePayment"
import type { SuccessfulPaymentDataType } from "@/type/payment"
import { CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { toast } from "sonner"

export default function OrderSuccessPage() {
    const [ search ] = useSearchParams()
    const dataQuery = search.get("data");
    const [ transaction, setTransaction ] = useState<SuccessfulPaymentDataType>({} as SuccessfulPaymentDataType)
    const navigate = useNavigate()

    const { data, isError, error, isLoading } = useGetPaymentSuccess(transaction.transaction_uuid);

    useEffect(() => {
        console.log(dataQuery)
        if (dataQuery) {
            try {
                setTransaction(JSON.parse(atob(dataQuery)))
            } catch (error) {
                toast.error("Invalid payment Id!!")
                console.log("Error in catch of ordersuccess useeffect", error)
                navigate("/")
            }
        }
        else
            navigate("/");
    }, [ search ])

    if (isError) {
        console.log(error)
        navigate("/")
    }
    if (isLoading)
        return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-12 md:py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent mb-6">
                            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-accent-foreground" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">
                            Order Successfully Placed!
                        </h1>
                        <p className="text-lg text-muted-foreground text-balance">
                            Thank you for your purchase. Your payment has been confirmed and your order is being processed.
                        </p>
                    </div>

                    {/* Transaction Details */}
                    <Card className="p-6 md:p-8 mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-6">Transaction Details</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-border">
                                <span className="text-muted-foreground">Transaction Code</span>
                                <span className="font-mono font-semibold text-foreground">{transaction?.transaction_code || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center pb-4 border-b border-border">
                                <span className="text-muted-foreground">Transaction ID</span>
                                <span className="font-mono text-sm text-foreground">{transaction?.transaction_uuid || "-"}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-lg font-medium text-foreground">Total Amount</span>
                                <span className="text-2xl font-bold text-foreground">Rs. {transaction?.total_amount || "-.--"}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Ordered Items */}
                    {/* <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-foreground mb-6">Your Order</h2>
                        <div className="grid gap-4 md:gap-6">
                            {cartItems.map((item) => (
                                <Card key={item.cart_item_id} className="overflow-hidden">
                                    <div className="flex flex-col sm:flex-row gap-6 p-6">
                                        <div className="w-full sm:w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.product_image_url || "/placeholder.svg"}
                                                alt={item.product_image_alt_text}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <h3 className="text-lg font-semibold text-foreground">{item.product_name}</h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <span>
                                                    Size: <span className="text-foreground">XL</span>
                                                </span>
                                                <span>
                                                    Color: <span className="text-foreground">Beige</span>
                                                </span>
                                                <span>
                                                    Quantity: <span className="text-foreground">{item.quantity}</span>
                                                </span>
                                            </div>
                                            <p className="text-lg font-semibold text-foreground pt-2">${item.price_snapshot.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div> */}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Link to="/">Return to Homepage</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                            <Link to="/orders">View All Orders</Link>
                        </Button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-12 text-center text-sm text-muted-foreground">
                        <p>A confirmation email has been sent to your registered email address.</p>
                        <p className="mt-2">For any questions, please contact our support team.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
