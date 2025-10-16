
import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Plus, X, Loader2 } from "lucide-react"

interface ProductImage {
    url: string
    alt_text: string
    is_primary: boolean
    uploading?: boolean
}

interface Product {
    sku: string,
    name: string,
    slug: string,
    short_description: string,
    description: string,
    status: "active" | "draft" | "archived",
    original_price: number,
    current_price: number,
    currency: string,
    is_featured: boolean,
    is_returnable: boolean,
    warranty_info: string,
}

interface ProductVariant {
    sku: string
    color: string
    size: string
    original_price: number
    current_price: number
    available: number
    reserved: number
    on_hold: number
}

interface ProductDetail {
    text: string
}

export function ProductForm() {
    const [ isSubmitting, setIsSubmitting ] = useState(false)

    const [ product, setProduct ] = useState<Product>({
        sku: "",
        name: "",
        slug: "",
        short_description: "",
        description: "",
        status: "active",
        original_price: 0,
        current_price: 0,
        currency: "NPR",
        is_featured: true,
        is_returnable: true,
        warranty_info: ""
    })
    const [ images, setImages ] = useState<ProductImage[]>([ { url: "", alt_text: "", is_primary: true } ])
    const [ variants, setVariants ] = useState<ProductVariant[]>([
        { sku: "", color: "", size: "", original_price: 0, current_price: 0, available: 0, reserved: 0, on_hold: 0 },
    ])
    const [ details, setDetails ] = useState<ProductDetail[]>([ { text: "" } ])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        // setIsSubmitting(true)

        const response = await fetch("http://localhost:3000/api/products/add-product", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "sku": product.sku,
                "name": product.name,
                "slug": product.slug,
                "short_description": product.short_description,
                "description": product.description,
                "status": product.status,
                "original_price": product.original_price,
                "current_price": product.current_price,
                "currency": product.currency,
                "is_featured": product.is_featured,
                "is_returnable": product.is_returnable,
                "warranty_info": product.warranty_info,
                "images": images,
                "variants": variants,
                "details": details
            })
        })

        const data = await response.json()

        console.log(data)

        setIsSubmitting(false)
        // Reset form or show success message
    }

    const addImage = () => {
        setImages([ ...images, { url: "", alt_text: "", is_primary: false } ])
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const updateImage = (index: number, field: keyof ProductImage, value: string | boolean) => {
        const newImages = [ ...images ]
        newImages[ index ] = { ...newImages[ index ], [ field ]: value }
        setImages(newImages)
    }

    const updateProduct = (field: keyof Product, value: string | number | boolean) => {
        setProduct(prev => ({ ...prev, [ field ]: value }))
    }

    const addVariant = () => {
        setVariants([
            ...variants,
            { sku: "", color: "", size: "", original_price: 0, current_price: 0, available: 0, reserved: 0, on_hold: 0 },
        ])
    }

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index))
    }

    const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
        const newVariants = [ ...variants ]
        newVariants[ index ] = { ...newVariants[ index ], [ field ]: value }
        setVariants(newVariants)
    }

    const addDetail = () => {
        setDetails([ ...details, { text: "" } ])
    }

    const removeDetail = (index: number) => {
        setDetails(details.filter((_, i) => i !== index))
    }

    const updateDetail = (index: number, value: string) => {
        const newDetails = [ ...details ]
        newDetails[ index ] = { text: value }
        setDetails(newDetails)
    }

    const handleImageUpload = async (index: number, file: File) => {
        // Set uploading state
        const newImages = [ ...images ]
        newImages[ index ] = { ...newImages[ index ], uploading: true }
        setImages(newImages)

        try {
            const formData = new FormData()
            formData.append("image", file)

            const response = await fetch("http://localhost:3000/api/disk-upload", {
                method: "POST",
                body: formData,
            })

            if (!response.ok) {
                throw new Error("Upload failed")
            }

            const data = await response.json()

            // Update image URL with uploaded file URL
            const updatedImages = [ ...images ]
            updatedImages[ index ] = { ...updatedImages[ index ], url: data.url, uploading: false }
            setImages(updatedImages)
        } catch (error) {
            console.error("Upload error:", error)
            // Reset uploading state on error
            const updatedImages = [ ...images ]
            updatedImages[ index ] = { ...updatedImages[ index ], uploading: false }
            setImages(updatedImages)
        }
    }

    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Fill in the details to add a new product to your inventory</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="sku">SKU</Label>
                                <Input
                                    id="sku"
                                    value={product.sku}
                                    onChange={(e) => updateProduct("sku", e.target.value)}
                                    placeholder="PRODUCT-SKU"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={product.name}
                                    onChange={(e) => updateProduct("name", e.target.value)}
                                    placeholder="Enter product name"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    value={product.slug}
                                    onChange={(e) => updateProduct("slug", e.target.value)}
                                    placeholder="product-slug"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    defaultValue="active"
                                    value={product.status}
                                    onValueChange={value => updateProduct("status", value)}
                                >
                                    <SelectTrigger id="status" className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="short_description">Short Description</Label>
                                <Input id="short_description"
                                    value={product.short_description}
                                    onChange={(e) => updateProduct("short_description", e.target.value)}
                                    placeholder="Brief product description" className="bg-background/50" />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="description">Full Description</Label>
                                <Textarea
                                    id="description"
                                    value={product.description}
                                    onChange={(e) => updateProduct("description", e.target.value)}
                                    placeholder="Detailed product description"
                                    rows={4}
                                    className="bg-background/50 resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Pricing</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="original_price">Original Price</Label>
                                <Input
                                    id="original_price"
                                    value={product.original_price}
                                    onChange={(e) => updateProduct("original_price", e.target.value)}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="current_price">Current Price</Label>
                                <Input
                                    id="current_price"
                                    value={product.current_price}
                                    onChange={(e) => updateProduct("current_price", e.target.value)}
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    required
                                    className="bg-background/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Select
                                    defaultValue="NPR"
                                    value={product.currency}
                                    onValueChange={value => updateProduct("currency", value)}
                                >
                                    <SelectTrigger id="currency" className="bg-background/50">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="NPR">NPR</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-foreground">Product Settings</h3>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="flex items-center justify-between space-x-2 rounded-lg border border-border/50 bg-background/30 p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_featured" className="cursor-pointer">
                                        Featured Product
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Display this product prominently</p>
                                </div>
                                <Switch id="is_featured" checked={product.is_featured} onCheckedChange={checked => updateProduct("is_featured", checked)} />
                            </div>

                            <div className="flex items-center justify-between space-x-2 rounded-lg border border-border/50 bg-background/30 p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_returnable" className="cursor-pointer">
                                        Returnable
                                    </Label>
                                    <p className="text-sm text-muted-foreground">Allow returns for this product</p>
                                </div>
                                <Switch id="is_returnable" checked={product.is_returnable} onCheckedChange={checked => updateProduct("is_returnable", checked)} defaultChecked />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="warranty_info">Warranty Information</Label>
                                <Input
                                    id="warranty_info"
                                    value={product.warranty_info}
                                    onChange={(e) => updateProduct("warranty_info", e.target.value)}
                                    placeholder="e.g., 1-Year Manufacturer Warranty"
                                    className="bg-background/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Product Images</h3>
                            <Button type="button" onClick={addImage} size="sm" variant="outline" className="gap-2 bg-transparent">
                                <Plus className="h-4 w-4" />
                                Add Image
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {images.map((image, index) => (
                                <div key={index} className="rounded-lg border border-border/50 bg-background/30 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Image {index + 1}</span>
                                        {images.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor={`image-upload-${index}`}>Upload Image</Label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <Input
                                                        id={`image-upload-${index}`}
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[ 0 ]
                                                            if (file) {
                                                                handleImageUpload(index, file)
                                                            }
                                                        }}
                                                        disabled={image.uploading}
                                                        className="bg-background/50"
                                                    />
                                                </div>
                                                {image.uploading && (
                                                    <div className="flex items-center gap-2 px-3 text-sm text-muted-foreground">
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Uploading...
                                                    </div>
                                                )}
                                            </div>
                                            {image.url && (
                                                <div className="mt-2 rounded-lg border border-border/50 bg-background/20 p-2">
                                                    <img
                                                        src={image.url || "/placeholder.svg"}
                                                        alt={image.alt_text || "Product image preview"}
                                                        className="h-32 w-full object-cover rounded"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`image-alt-${index}`}>Alt Text</Label>
                                            <Input
                                                id={`image-alt-${index}`}
                                                value={image.alt_text}
                                                onChange={(e) => updateImage(index, "alt_text", e.target.value)}
                                                placeholder="Image description"
                                                className="bg-background/50"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`image-primary-${index}`}
                                            checked={image.is_primary}
                                            onCheckedChange={(checked) => updateImage(index, "is_primary", checked)}
                                        />
                                        <Label htmlFor={`image-primary-${index}`} className="cursor-pointer">
                                            Primary Image
                                        </Label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Product Variants</h3>
                            <Button type="button" onClick={addVariant} size="sm" variant="outline" className="gap-2 bg-transparent">
                                <Plus className="h-4 w-4" />
                                Add Variant
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {variants.map((variant, index) => (
                                <div key={index} className="rounded-lg border border-border/50 bg-background/30 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Variant {index + 1}</span>
                                        {variants.length > 1 && (
                                            <Button
                                                type="button"
                                                onClick={() => removeVariant(index)}
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-sku-${index}`}>Variant SKU</Label>
                                            <Input
                                                id={`variant-sku-${index}`}
                                                value={variant.sku}
                                                onChange={(e) => updateVariant(index, "sku", e.target.value)}
                                                placeholder="VAR-SKU"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-color-${index}`}>Color</Label>
                                            <Input
                                                id={`variant-color-${index}`}
                                                value={variant.color}
                                                onChange={(e) => updateVariant(index, "color", e.target.value)}
                                                placeholder="Black"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-size-${index}`}>Size</Label>
                                            <Input
                                                id={`variant-size-${index}`}
                                                value={variant.size}
                                                onChange={(e) => updateVariant(index, "size", e.target.value)}
                                                placeholder="Standard"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-original-price-${index}`}>Original Price</Label>
                                            <Input
                                                id={`variant-original-price-${index}`}
                                                type="number"
                                                step="0.01"
                                                value={variant.original_price}
                                                onChange={(e) => updateVariant(index, "original_price", Number.parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-current-price-${index}`}>Current Price</Label>
                                            <Input
                                                id={`variant-current-price-${index}`}
                                                type="number"
                                                step="0.01"
                                                value={variant.current_price}
                                                onChange={(e) => updateVariant(index, "current_price", Number.parseFloat(e.target.value) || 0)}
                                                placeholder="0.00"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-available-${index}`}>Available</Label>
                                            <Input
                                                id={`variant-available-${index}`}
                                                type="number"
                                                value={variant.available}
                                                onChange={(e) => updateVariant(index, "available", Number.parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-reserved-${index}`}>Reserved</Label>
                                            <Input
                                                id={`variant-reserved-${index}`}
                                                type="number"
                                                value={variant.reserved}
                                                onChange={(e) => updateVariant(index, "reserved", Number.parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="bg-background/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor={`variant-on-hold-${index}`}>On Hold</Label>
                                            <Input
                                                id={`variant-on-hold-${index}`}
                                                type="number"
                                                value={variant.on_hold}
                                                onChange={(e) => updateVariant(index, "on_hold", Number.parseInt(e.target.value) || 0)}
                                                placeholder="0"
                                                className="bg-background/50"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-foreground">Product Details</h3>
                            <Button type="button" onClick={addDetail} size="sm" variant="outline" className="gap-2 bg-transparent">
                                <Plus className="h-4 w-4" />
                                Add Detail
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {details.map((detail, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={detail.text}
                                        onChange={(e) => updateDetail(index, e.target.value)}
                                        placeholder="Enter product detail"
                                        className="bg-background/50"
                                    />
                                    {details.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeDetail(index)}
                                            size="icon"
                                            variant="ghost"
                                            className="shrink-0 text-destructive hover:text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-border/50">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-accent text-accent-foreground hover:bg-accent/90"
                        >
                            {isSubmitting ? "Adding Product..." : "Add Product"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
