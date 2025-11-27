import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function ShippingStep() {
    return (
        <Card className="p-8">
            <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">First Name</label>
                        <Input placeholder="Enter first name" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Last Name</label>
                        <Input placeholder="Enter last name" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Email Address</label>
                    <Input type="email" placeholder="Enter email address" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input placeholder="Enter phone number" />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Street Address</label>
                    <Input placeholder="Enter street address" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium mb-2">City</label>
                        <Input placeholder="Enter city" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">State</label>
                        <Input placeholder="Enter state" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Postal Code</label>
                        <Input placeholder="Enter postal code" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Country</label>
                    <Input placeholder="Enter country" />
                </div>
            </form>
        </Card>
    )
}
