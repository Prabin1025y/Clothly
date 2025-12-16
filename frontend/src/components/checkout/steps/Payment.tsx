import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import CryptoJs from 'crypto-js';

export default function PaymentStep({ totalPrice }: { totalPrice: number }) {
    const [ formData, setFormData ] = useState({
        amount: totalPrice.toString(),
        tax_amount: "0",
        total_amount: totalPrice.toString(),
        transaction_uuid: uuidv4(),
        product_service_charge: "0",
        product_delivery_charge: "0",
        product_code: "EPAYTEST",
        success_url: "http://localhost:5173/checkout",
        failure_url: "http://localhost:5173/checkout",
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: ""
    })
    const handlePayment = async () => {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://rc-epay.esewa.com.np/api/epay/main/v2/form";


        Object.entries(formData).forEach(([ key, value ]) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = value;
            form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
    }
    return (
        <div className="space-y-6">
            {/* Payment Method Selection */}
            <Card className="p-6">
                <h3 className="font-bold text-lg mb-4">Select Payment Method</h3>
                <Item variant="outline">
                    <ItemMedia>
                        <Avatar className="size-10">
                            <AvatarImage src="https://p7.hiclipart.com/preview/261/608/1001/esewa-zone-office-bayalbas-google-play-iphone-iphone-thumbnail.jpg" />
                            <AvatarFallback>ESewa Logo</AvatarFallback>
                        </Avatar>
                    </ItemMedia>
                    <ItemContent>
                        <ItemTitle>Pay via E-Sewa</ItemTitle>
                    </ItemContent>
                    <ItemActions>
                        <Button
                            size="icon-sm"
                            variant="outline"
                            onClick={handlePayment}
                            className="rounded-full px-10 py-2 bg-[#37ff00] hover:bg-[#2ab404] cursor-pointer"
                            aria-label="Invite"
                        >
                            Pay
                        </Button>
                    </ItemActions>
                </Item>
            </Card>
        </div>
    )
}
