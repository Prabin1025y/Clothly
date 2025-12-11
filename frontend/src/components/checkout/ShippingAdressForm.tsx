"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import type { CreateShippingAddressDto } from "@/type/shippingAddress"
import { useCreateShippingAddress } from "@/hooks/useShippingAddresses"

interface ShippingAddressFormProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShippingAddressForm({ isOpen, onClose }: ShippingAddressFormProps) {
    const createShippingAddress = useCreateShippingAddress();
    const [ formData, setFormData ] = useState<CreateShippingAddressDto>({
        label: "",
        recipient_name: "",
        district: "",
        province: "",
        city: "",
        tole_name: "",
        postal_code: "",
        phone: "",
        is_default: false
    })

    const [ errors, setErrors ] = useState<Partial<Record<keyof CreateShippingAddressDto, string>>>({})

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof CreateShippingAddressDto, string>> = {};

        if (!formData.label.trim()) newErrors.label = "Label is required"
        if (!formData.recipient_name.trim()) newErrors.recipient_name = "Recipient name is required"
        if (!formData.district.trim()) newErrors.district = "District is required"
        if (!formData.province.trim()) newErrors.province = "Province is required"
        if (!formData.city.trim()) newErrors.city = "City is required"
        if (!formData.phone.trim()) newErrors.phone = "Phone is required"
        else if (!/^\+?[\d\-\s()]+$/.test(formData.phone) || formData.phone.replace(/\D/g, "").length < 10) {
            newErrors.phone = "Please enter a valid phone number"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [ name ]: type === "checkbox" ? checked : value,
        }))

        // Clear error for this field when user starts typing
        if (errors[ name as keyof CreateShippingAddressDto ]) {
            setErrors((prev) => ({
                ...prev,
                [ name ]: "",
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        try {
            onClose();
            await createShippingAddress.mutateAsync(formData);

            resetForm();
        } catch (error) {
            console.error("Error while createing shipping address!! ", error);
        }
    }

    // Reset form to initial state
    const resetForm = () => {
        setFormData({
            label: "",
            recipient_name: "",
            district: "",
            province: "",
            city: "",
            tole_name: "",
            postal_code: "",
            phone: "",
            is_default: false,
        });
        setErrors({});
    };

    //Dont render if form is not open.
    if (!isOpen) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="label">Address Label</Label>
                    <Input
                        id="label"
                        name="label"
                        placeholder="e.g., Home, Office"
                        value={formData.label}
                        onChange={handleChange}
                        className={errors.label ? "border-destructive" : ""}
                    />
                    {errors.label && <p className="text-sm text-destructive">{errors.label}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="recipient_name">Recipient Name</Label>
                    <Input
                        id="recipient_name"
                        name="recipient_name"
                        placeholder="Full name"
                        value={formData.recipient_name}
                        onChange={handleChange}
                        className={errors.recipient_name ? "border-destructive" : ""}
                    />
                    {errors.recipient_name && <p className="text-sm text-destructive">{errors.recipient_name}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        name="phone"
                        placeholder="+977-1-4234567"
                        value={formData.phone}
                        onChange={handleChange}
                        className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="province">Province</Label>
                    <Input
                        id="province"
                        name="province"
                        placeholder="e.g., Bagmati"
                        value={formData.province}
                        onChange={handleChange}
                        className={errors.province ? "border-destructive" : ""}
                    />
                    {errors.province && <p className="text-sm text-destructive">{errors.province}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Input
                        id="district"
                        name="district"
                        placeholder="e.g., Kathmandu"
                        value={formData.district}
                        onChange={handleChange}
                        className={errors.district ? "border-destructive" : ""}
                    />
                    {errors.district && <p className="text-sm text-destructive">{errors.district}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        name="city"
                        placeholder="City name"
                        value={formData.city}
                        onChange={handleChange}
                        className={errors.city ? "border-destructive" : ""}
                    />
                    {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="tole_name">Tole/Street Name</Label>
                    <Input
                        id="tole_name"
                        name="tole_name"
                        placeholder="Street or tole name"
                        value={formData.tole_name ?? ""}
                        onChange={handleChange}
                        className={errors.tole_name ? "border-destructive" : ""}
                    />
                    {errors.tole_name && <p className="text-sm text-destructive">{errors.tole_name}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="postal_code">Postal Code</Label>
                    <Input
                        id="postal_code"
                        name="postal_code"
                        placeholder="e.g., 44600"
                        value={formData.postal_code ?? ""}
                        onChange={handleChange}
                        className={errors.postal_code ? "border-destructive" : ""}
                    />
                    {errors.postal_code && <p className="text-sm text-destructive">{errors.postal_code}</p>}
                </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                            ...prev,
                            is_default: checked as boolean,
                        }))
                    }
                />
                <Label htmlFor="is_default" className="font-normal cursor-pointer">
                    Set as default address
                </Label>
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                    Add Address
                </Button>
                <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                </Button>
            </div>
        </form>
    )
}
