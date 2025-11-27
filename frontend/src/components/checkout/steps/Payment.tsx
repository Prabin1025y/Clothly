import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function PaymentStep() {
    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Select Payment Method</h3>
                <RadioGroup defaultValue="card">
                    <div className="flex items-center space-x-2 mb-4 p-4 border border-border rounded-lg hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="card" id="card" />
                        <label htmlFor="card" className="flex-1 cursor-pointer">
                            <div className="font-medium">Credit/Debit Card</div>
                            <div className="text-sm text-muted-foreground">Pay securely with your card</div>
                        </label>
                    </div>

                    <div className="flex items-center space-x-2 mb-4 p-4 border border-border rounded-lg hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="easypaisa" id="easypaisa" />
                        <label htmlFor="easypaisa" className="flex-1 cursor-pointer">
                            <div className="font-medium">Easypaisa</div>
                            <div className="text-sm text-muted-foreground">Mobile wallet payment</div>
                        </label>
                    </div>

                    <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted cursor-pointer">
                        <RadioGroupItem value="bank" id="bank" />
                        <label htmlFor="bank" className="flex-1 cursor-pointer">
                            <div className="font-medium">Bank Transfer</div>
                            <div className="text-sm text-muted-foreground">Direct bank payment</div>
                        </label>
                    </div>
                </RadioGroup>
            </Card>

            {/* Card Details Form */}
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Card Details</h3>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Card Number</label>
                        <Input placeholder="1234 5678 9012 3456" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Expiry Date</label>
                            <Input placeholder="MM/YY" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">CVV</label>
                            <Input placeholder="123" type="password" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                        <Input placeholder="John Doe" />
                    </div>
                </form>
            </Card>
        </div>
    )
}
