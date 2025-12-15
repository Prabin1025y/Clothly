import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function PaymentStep() {
    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Select Payment Method</h3>

            </Card>
        </div>
    )
}
