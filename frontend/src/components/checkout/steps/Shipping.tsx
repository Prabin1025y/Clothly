"use client"

import { useEffect, useState } from "react"
import { AlertOctagon, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label"
import { ShippingAddressForm } from "../ShippingAdressForm"
import { useShippingAddresses } from "@/hooks/useShippingAddresses"
import { useQueryClient } from "@tanstack/react-query"


export default function ShippingInfo() {
    const [ selectedAddressId, setSelectedAddressId ] = useState<number>(-1)
    const [ showForm, setShowForm ] = useState(false)

    const handleSelectAddress = (addressId: string) => {
        setSelectedAddressId(Number(addressId))
    }
    const queryClient = useQueryClient();

    const {
        data,
        isLoading,
        isError,
        isFetching,
    } = useShippingAddresses();

    useEffect(() => {
        if (data?.data && Array.isArray(data?.data) && data?.data.length !== 0)
            setSelectedAddressId(Number(data?.data?.find(address => address.is_default)?.id) ?? Number(data?.data[ 0 ].id))
    }, [ data ])

    if (isLoading)
        return <div>Loading...</div>

    if (isError)
        return (
            <Empty >
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <AlertOctagon color="red" />
                    </EmptyMedia>
                    <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                    <EmptyDescription className="text-red-400">
                        An error occured while getting your cart items. Please try again!!
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex gap-2">
                        {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                            <Loader2 className="animate-spin" /> Retrying...
                        </Button> : <Button
                            className="cursor-pointer bg-red-500"
                            onClick={() => queryClient.invalidateQueries({ queryKey: [ "shipping-addresses", "list" ] })}
                        >
                            Retry
                        </Button>}
                    </div>
                </EmptyContent>
            </Empty>
        );

    const shippingAddresses = data?.data || [];

    return (
        <div className="w-full space-y-6">
            {/* <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="size-6" />
                    Shipping Address
                </h2>
                {isFetching && !isLoading && (
                    <span className="ml-2 text-sm text-blue-600">
                        ↻ Updating...
                    </span>
                )}
                <p className="text-muted-foreground mb-6">Select an existing address or add a new one for delivery</p>
            </div> */}

            {/* Existing Addresses */}
            <div className="space-y-3">
                <RadioGroup value={selectedAddressId.toString()} onValueChange={handleSelectAddress}>
                    {shippingAddresses.map((address) => (
                        <Card
                            key={address.id}
                            className="p-4 cursor-pointer transition-all hover:border-primary/50 border-2 border-transparent"
                        >
                            <div className="flex items-start gap-4">
                                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                                <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-foreground">
                                            {address.label}
                                            {address.is_default && (
                                                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground font-medium">{address.recipient_name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {address.tole_name}, {address.district}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            {address.city}, {address.province} {address.postal_code}
                                        </div>
                                        <div className="text-sm text-muted-foreground">{address.phone}</div>
                                    </div>
                                </Label>
                            </div>
                        </Card>
                    ))}
                </RadioGroup>
            </div>

            {/* Add New Address Section */}
            <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Add New Address</h3>
                        <p className="text-sm text-muted-foreground">Don't see your address? Add a new shipping location</p>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm" className="gap-2">
                        <Plus className="size-4" />
                        Add Address
                    </Button>
                </div>

                {/* Add Address Form */}
                {showForm && (
                    <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                        <ShippingAddressForm isOpen={showForm} onClose={() => setShowForm(false)} />
                    </div>
                )}
            </div>
        </div>
    )
}
