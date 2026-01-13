import { useEffect, useState } from "react"
import { AlertOctagon, Loader2, MapPin, MoreVertical, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Label } from "@/components/ui/label"
import { ShippingAddressForm } from "../ShippingAdressForm"
import { useDeleteShippingAddress, useMakeAddressDefault, useShippingAddresses } from "@/hooks/useShippingAddresses"
import { useQueryClient } from "@tanstack/react-query"
import { useInfoStore } from "@/zustand/infoStore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShippingInfoSkeleton } from "@/Skeletons/ShippingAddressSkeleton"


export default function ShippingInfo() {
    // const [ selectedAddressId, setSelectedAddressId ] = useState<number>(-1)
    const [ showForm, setShowForm ] = useState(false)
    const { setCurrentShippingAddress, currentShippingAddress } = useInfoStore();

    const handleSelectAddress = (id: string) => {
        // setSelectedAddressId(Number(addressId))
        setCurrentShippingAddress(shippingAddresses.find(address => address.id === id) ?? null)
    }
    const queryClient = useQueryClient();
    const deleteShippingAddress = useDeleteShippingAddress();
    const makeAddressDefault = useMakeAddressDefault();

    const {
        data,
        isLoading,
        isError,
        isFetching,
    } = useShippingAddresses();

    useEffect(() => {
        if (data && Array.isArray(data) && data?.length !== 0)
            setCurrentShippingAddress(data?.find(address => address.is_default) ?? data[ 0 ])
        // setSelectedAddressId(Number(data?.data?.find(address => address.is_default)?.id) ?? Number(data?.data[ 0 ].id))
    }, [ data, setCurrentShippingAddress ])

    if (isLoading)
        return <ShippingInfoSkeleton />

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

    const shippingAddresses = data || [];
    console.log(shippingAddresses)

    return (
        <div className="w-full space-y-6">
            {/* Existing Addresses */}
            <div className="space-y-3">
                <RadioGroup value={currentShippingAddress?.id?.toString()} onValueChange={handleSelectAddress}>
                    {shippingAddresses.map((address) => (
                        <Card className="p-4 cursor-pointer transition-all hover:border-primary/50 border-2 border-transparent">
                            <div className="flex items-start gap-4">
                                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                                <Label htmlFor={`address-${address.id}`} className="flex-1 cursor-pointer">
                                    <div className="space-y-2">
                                        <div className="font-semibold text-foreground">
                                            {address.label}
                                            {address.is_default && (
                                                <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Default</span>
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
                                        {address.base_shipping_cost !== undefined && (
                                            <div className="text-sm font-semibold text-foreground mt-3 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" />
                                                Base Shipping: Rs. {address.base_shipping_cost}
                                            </div>
                                        )}
                                    </div>
                                </Label>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="h-4 w-4" />
                                            <span className="sr-only">Open menu</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {!address.is_default && (
                                            <>
                                                <DropdownMenuItem onClick={() => makeAddressDefault.mutateAsync(address.id)}>Set as Default</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                            </>
                                        )}
                                        <DropdownMenuItem variant="destructive" onClick={() => deleteShippingAddress.mutateAsync(address.id)}  >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Address
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
