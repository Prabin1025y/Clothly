import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { useEffect, useState } from "react"
import { v4 as uuidv4 } from 'uuid';
import CryptoJs from 'crypto-js';
import { axiosClient } from "@/lib/axios"

export default function PaymentStep({ totalPrice }: { totalPrice: number }) {
    const [ formData, setFormData ] = useState({
        amount: "100",
        tax_amount: "0",
        total_amount: "100",
        transaction_uuid: uuidv4(),
        product_service_charge: "0",
        product_delivery_charge: "0",
        product_code: "EPAYTEST",
        success_url: "http://localhost:5173/checkout",
        failure_url: "http://localhost:5173/checkout",
        signed_field_names: "total_amount,transaction_uuid,product_code",
        signature: "",
        secret: "8gBm/:&EnhH.1/q"
    })
    const handlePayment = async () => {
        const payload = new FormData();
        payload.append("amount", formData.amount);
        payload.append("tax_amount", formData.tax_amount);
        payload.append("total_amount", formData.total_amount);
        payload.append("transaction_uuid", formData.transaction_uuid);
        payload.append("product_service_charge", formData.product_service_charge);
        payload.append("product_delivery_charge", formData.product_delivery_charge);
        payload.append("product_code", formData.product_code);
        payload.append("success_url", formData.success_url);
        payload.append("failure_url", formData.failure_url);
        payload.append("signed_field_names", formData.signed_field_names);
        payload.append("signature", formData.signature);

        await axiosClient.post("https://rc-epay.esewa.com.np/api/epay/main/v2/form", payload);
    }

    const generateSignature = (total_amount: string, transaction_uuid: string, product_code: string, secret: string) => {
        const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
        const hash = CryptoJs.HmacSHA256(hashString, secret);
        return CryptoJs.enc.Base64.stringify(hash);
    }

    useEffect(() => {
        const { total_amount, transaction_uuid, product_code, secret } = formData;
        const hashedSignature = generateSignature(total_amount, transaction_uuid, product_code, secret)

        setFormData({ ...formData, signature: hashedSignature })
    }, [ formData.amount ])

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
