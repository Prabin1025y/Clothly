import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Item, ItemActions, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import { v4 as uuidv4 } from 'uuid';
import { useGenerateSignature } from "@/hooks/usePayment"
import { toast } from "sonner"
import type { FormDataType } from "@/type/payment"
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";
import { useCreateOrder } from "@/hooks/useOrders";
import { useInfoStore } from "@/zustand/infoStore";

export default function PaymentStep({ totalPrice }: { totalPrice: number }) {
    const [ loading, setLoading ] = useState(false)

    const generateSignature = useGenerateSignature();
    const { currentShippingAddress } = useInfoStore();
    const createOrder = useCreateOrder();
    const handlePayment = async () => {
        try {
            setLoading(true);
            if (!currentShippingAddress) {
                toast.error("Invalid shipping address!");
                return;
            }

            const transaction_uuid = uuidv4();

            const { success } = await createOrder.mutateAsync({
                shipping_address_id: Number(currentShippingAddress.id),
                payment_method: "esewa",
                notes: "give it to me fast fast!!", //TODO: change this part
                transaction_uuid: transaction_uuid
            })

            if (!success) {
                throw new Error("Order could not be placed")
            }

            const formData: FormDataType = {
                amount: totalPrice.toString(),
                tax_amount: "0",
                total_amount: totalPrice.toString(),
                transaction_uuid: transaction_uuid,
                product_service_charge: "0",
                product_delivery_charge: "0",
                product_code: "EPAYTEST",
                success_url: "http://localhost:5173/order-success",
                failure_url: "http://localhost:5173/order-failure",
                signed_field_names: "total_amount,transaction_uuid,product_code",
                signature: ""
            }

            const { signature } = await generateSignature.mutateAsync({
                product_code: formData.product_code,
                total_amount: totalPrice.toString(),
                transaction_uuid: formData.transaction_uuid
            })

            if (!signature)
                return toast.error("No transaction signature found!");

            formData[ 'signature' ] = signature;


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
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (loading) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        // cleanup
        return () => {
            document.body.style.overflow = "";
        };
    }, [ loading ])


    return (
        <div className="space-y-6">
            {loading && <div className="w-screen h-screen bg-black/20 backdrop-blur-sm fixed z-30 inset-0 flex items-center justify-center">
                <Loader className="animate-spin shadow-2xl shadow-white" color="orange" size={50} />
            </div>}
            {/* Payment Method Selection */}
            <div className="p-6 ">
                {/* <h3 className="font-bold text-lg mb-4">Select Payment Method</h3> */}
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
            </div>
        </div>
    )
}
