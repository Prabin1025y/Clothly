"use client"

import { useState } from "react"
import { MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ShippingAddressForm } from "../ShippingAdressForm"
import { toast } from "sonner"
import { useQuery } from "@tanstack/react-query"

export interface ShippingAddress {
    id: string
    label: string
    recipient_name: string
    district: string
    province: string
    city: string
    tole_name: string
    postal_code: string
    phone: string
    is_default: boolean
}

interface ShippingInfoProps {
    addresses?: ShippingAddress[]
    onAddressSelect?: (address: ShippingAddress) => void
    onAddAddress?: (address: ShippingAddress) => void
}

export default function ShippingInfo({
    addresses = [
        {
            id: "1",
            label: "Home",
            recipient_name: "John Doe",
            district: "Kathmandu",
            province: "Bagmati",
            city: "Kathmandu",
            tole_name: "New Road",
            postal_code: "44600",
            phone: "+977-1-4234567",
            is_default: true,
        },
        {
            id: "2",
            label: "Office",
            recipient_name: "Jane Smith",
            district: "Lalitpur",
            province: "Bagmati",
            city: "Lalitpur",
            tole_name: "Patan Dhoka",
            postal_code: "44700",
            phone: "+977-1-5678901",
            is_default: false,
        },
    ],
    onAddressSelect,
    onAddAddress,
}: ShippingInfoProps) {
    const [ selectedAddressId, setSelectedAddressId ] = useState(
        addresses.find((addr) => addr.is_default)?.id || addresses[ 0 ]?.id,
    )
    const [ showForm, setShowForm ] = useState(false)
    const [ shippingAddresses, setShippingAddresses ] = useState(addresses)

    const handleSelectAddress = (addressId: string) => {
        setSelectedAddressId(addressId)
        const selected = shippingAddresses.find((addr) => addr.id === addressId)
        if (selected && onAddressSelect) {
            onAddressSelect(selected)
        }
    }

    const queryResult = useQuery({
        queryKey: [ 'shipping-address' ],
        queryFn: async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACKEN_URL}/shipping-addresses/get-shipping-address`, {
                    method: "GET",
                    credentials: 'include'
                })
                const result = await response.json();
                if (result?.success) {
                    return result?.data;
                }
            } catch (error) {
                toast.error("Something went wrong!!");
            }
        }
    })

    const handleAddAddress = async (newAddress: ShippingAddress) => {
        if (newAddress.is_default) {
            const oldAddressClean = shippingAddresses.map(addr => {
                if (addr.is_default) {
                    return { ...addr, is_default: false }
                } else {
                    return addr;
                }
            });
            setShippingAddresses(oldAddressClean.concat(newAddress))
        } else {
            setShippingAddresses([ ...shippingAddresses, newAddress ])
        }
        setShowForm(false)
        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/shipping-addresses/add-shipping-address`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    label: newAddress.label,
                    recipient_name: newAddress.recipient_name,
                    district: newAddress.district,
                    province: newAddress.province,
                    city: newAddress.city,
                    tole_name: newAddress.tole_name,
                    postal_code: newAddress.postal_code,
                    phone: newAddress.phone,
                    is_default: newAddress.is_default
                })
            })
            const result = await response.json();
            if (result?.success) {
                toast.success("Shipping address addes!");
            }
        } catch (error) {
            toast.error("Something went wrong!!");
        }

    }

    return (
        <div className="w-full space-y-6">
            <div>
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="size-6" />
                    Shipping Address
                </h2>
                <p className="text-muted-foreground mb-6">Select an existing address or add a new one for delivery</p>
            </div>

            {/* Existing Addresses */}
            <div className="space-y-3">
                <RadioGroup value={selectedAddressId} onValueChange={handleSelectAddress}>
                    {shippingAddresses.map((address) => (
                        <Card
                            key={address.id}
                            className="p-4 cursor-pointer transition-all hover:border-primary/50 border-2 border-transparent"
                        // onClick={() => handleSelectAddress(address.id)}
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
                        <ShippingAddressForm onSubmit={handleAddAddress} onCancel={() => setShowForm(false)} />
                    </div>
                )}
            </div>
        </div>
    )
}
