import type React from "react"
import { useEffect, useState } from "react"
import { Plus, X, Upload, AlertOctagon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ColorVariant, ProductDetail, ProductImage } from "@/type/adminProducts"
import { adminProductsKeys, useAddAdminProducts, useAdminProductDetailBySlug } from "@/hooks/useAdminProducts"
import { useParams } from "react-router"
import { useQueryClient } from "@tanstack/react-query"
import { v4 as uuidv4 } from 'uuid'

type ProductImageEditType = Omit<ProductImage, 'file'> & { file?: File }


export default function EditProductPage() {
    const queryClient = useQueryClient();
    const { slug: productSlug } = useParams()
    // Main Product Info
    const [ productName, setProductName ] = useState("")
    const [ sku, setSku ] = useState("")
    const [ slug, setSlug ] = useState("")
    const [ shortDescription, setShortDescription ] = useState("")
    const [ description, setDescription ] = useState("")
    const [ status, setStatus ] = useState("active")
    const [ originalPrice, setOriginalPrice ] = useState("")
    const [ discountedPrice, setDiscountedPrice ] = useState("")
    const [ warranty, setWarranty ] = useState("")

    // Images
    const [ images, setImages ] = useState<ProductImageEditType[]>([])
    const [ imageInputKey, setImageInputKey ] = useState(0)

    // Details
    const [ details, setDetails ] = useState<ProductDetail[]>([])
    const [ detailText, setDetailText ] = useState("")

    // Color Variants
    const [ colorVariants, setColorVariants ] = useState<ColorVariant[]>([])
    const [ expandedVariant, setExpandedVariant ] = useState<string | null>(null)

    // Handle Image Upload
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files
        if (files) {
            Array.from(files).forEach((file) => {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const newImage: ProductImage = {
                        id: Math.random().toString(36).substr(2, 9),
                        file,
                        preview: event.target?.result as string,
                        altText: "",
                        isPrimary: images.length === 0,
                    }
                    setImages([ ...images, newImage ])
                }
                reader.readAsDataURL(file)
            })
        }
        setImageInputKey((prev) => prev + 1)
    }

    // Set Primary Image
    const setPrimaryImage = (id: string) => {
        setImages(images.map((img) => ({ ...img, isPrimary: img.id === id })))
    }

    // Remove Image
    const removeImage = (id: string) => {
        const remaining = images.filter((img) => img.id !== id)
        if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
            remaining[ 0 ].isPrimary = true
        }
        setImages(remaining)
    }

    // Add Detail Point
    const addDetail = () => {
        if (detailText.trim()) {
            setDetails([ ...details, { id: Math.random().toString(36).substr(2, 9), text: detailText } ])
            setDetailText("")
        }
    }

    // Remove Detail
    const removeDetail = (id: string) => {
        setDetails(details.filter((d) => d.id !== id))
    }

    // Add Color Variant
    const addColorVariant = () => {
        const newVariant: ColorVariant = {
            id: Math.random().toString(36).substr(2, 9),
            colorName: "",
            colorHex: "#000000",
            sizes: [],
        }
        setColorVariants([ ...colorVariants, newVariant ])
    }

    // Update Color Variant
    const updateColorVariant = (id: string, field: string, value: any) => {
        setColorVariants(colorVariants.map((v) => (v.id === id ? { ...v, [ field ]: value } : v)))
    }

    // Add Size to Variant
    const addSizeToVariant = (variantId: string) => {
        setColorVariants(
            colorVariants.map((v) =>
                v.id === variantId
                    ? {
                        ...v,
                        sizes: [
                            ...v.sizes,
                            {
                                id: Math.random().toString(36).substr(2, 9),
                                size: "",
                                quantity: 0,
                            },
                        ],
                    }
                    : v,
            ),
        )
    }

    // Update Size in Variant
    const updateSize = (variantId: string, sizeId: string, field: string, value: any) => {
        setColorVariants(
            colorVariants.map((v) =>
                v.id === variantId
                    ? {
                        ...v,
                        sizes: v.sizes.map((s) => (s.id === sizeId ? { ...s, [ field ]: value } : s)),
                    }
                    : v,
            ),
        )
    }

    // Remove Size from Variant
    const removeSize = (variantId: string, sizeId: string) => {
        setColorVariants(
            colorVariants.map((v) => (v.id === variantId ? { ...v, sizes: v.sizes.filter((s) => s.id !== sizeId) } : v)),
        )
    }

    // Remove Color Variant
    const removeColorVariant = (id: string) => {
        setColorVariants(colorVariants.filter((v) => v.id !== id))
    }

    const validateForm = (): { valid: boolean, message: string } => {
        if (!productName.trim()) {
            // seterror("Product name is required")
            return { valid: false, message: "Product name is required" }
        }
        if (!sku.trim()) {
            // seterror("SKU is required")
            return { valid: false, message: "SKU is required" }
        }
        if (!slug.trim()) {
            // seterror("Slug is required")
            return { valid: false, message: "Slug is required" }
        }
        if (!shortDescription.trim()) {
            // seterror("Short description is required")
            return { valid: false, message: "Short description is required" }
        }
        if (!description.trim()) {
            // seterror("Description is required")
            return { valid: false, message: "Description is required" }
        }
        if (!status) {
            // seterror("Status is required")
            return { valid: false, message: "Status is required" }
        }
        if (!originalPrice || Number(originalPrice) <= 0) {
            // seterror("Valid original price is required")
            return { valid: false, message: "Valid original price is required" }
        }
        if (discountedPrice && Number(discountedPrice) >= Number(originalPrice)) {
            // seterror("Discounted price must be less than original price")
            return { valid: false, message: "Discounted price must be less than original price" }
        }
        if (!warranty.trim()) {
            // seterror("Warranty information is required")
            return { valid: false, message: "Warranty information is required" }
        }
        if (images.length === 0) {
            // seterror("At least one image is required")
            return { valid: false, message: "At least one image is required" }
        }
        if (details.length === 0) {
            // seterror("At least one product detail is required")
            return { valid: false, message: "At least one product detail is required" }
        }
        if (colorVariants.length === 0) {
            // seterror("At least one color variant is required")
            return { valid: false, message: "At least one color variant is required" }
        }
        for (const variant of colorVariants) {
            if (!variant.colorName.trim()) {
                // seterror("Variant name is required")
                return { valid: false, message: "Variant name is required" }
            }
            if (variant.sizes.length === 0) {
                // seterror("At least one size for each variant is required")
                return { valid: false, message: "At least one size for each variant is required" }
            }
        }
        // seterror(null)
        return { valid: true, message: "" }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const { valid, message } = validateForm();
        if (!valid) {
            toast.error(message || "Error occured while validating your input. Please check again!")
        }


        // Handle form submission here
        // await addProduct.mutateAsync({
        //     productName: productName,
        //     sku: sku,
        //     slug: slug,
        //     originalPrice: originalPrice,
        //     discountedPrice: discountedPrice,
        //     shortDescription: shortDescription,
        //     description: description,
        //     warranty: warranty,
        //     status: status,
        //     images: images,
        //     colorVariants: colorVariants,
        //     details: details
        // })
        console.log({
            productName,
            sku,
            slug,
            shortDescription,
            description,
            status,
            originalPrice,
            discountedPrice,
            warranty,
            images,
            details,
            colorVariants,
        })
    }

    const { data, isFetching, isLoading, error, isError } = useAdminProductDetailBySlug(productSlug ?? "")

    useEffect(() => {
        if (!data) return;

        setProductName(data.name)
        setSku(data.product_sku)
        setSlug(data.slug)
        setOriginalPrice(data.original_price)
        setDiscountedPrice(data.current_price)
        setDescription(data.description)
        setShortDescription(data.short_description)
        setWarranty(data.warranty_info)
        setStatus(data.status)

        const existingImages: ProductImageEditType[] = data.images.map(img => ({
            preview: img.url,
            id: uuidv4(),
            altText: img.alt_text,
            isPrimary: img.is_primary,
        }))
        setImageInputKey(existingImages.length)
        setImages(existingImages)
        console.log(data)
    }, [ data ])


    if (isError) {
        console.error(error);
        return <Empty >
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <AlertOctagon color="red" />
                </EmptyMedia>
                <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                <EmptyDescription className="text-red-400">
                    An error occured while fetching products. Please try again!!
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <div className="flex gap-2">
                    {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                        <Loader2 className="animate-spin" /> Retrying...
                    </Button> : <Button
                        className="cursor-pointer bg-red-500"
                        onClick={() => queryClient.invalidateQueries({ queryKey: adminProductsKeys.detail(productSlug || "") })}
                    >
                        Retry
                    </Button>}
                </div>
            </EmptyContent>
        </Empty>
    }

    if (isLoading)
        return (
            <div>...Loading</div>
        )

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Add New Product</h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Create a new product with all details, images, and variants
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Main Product Information */}
                    <section className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-6 text-xl font-semibold text-foreground">Product Information</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">Product Name *</label>
                                    <Input
                                        required
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="Enter product name"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">SKU *</label>
                                    <Input required value={sku} onChange={(e) => setSku(e.target.value)} placeholder="e.g., PROD-001" />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Slug *</label>
                                <Input
                                    required
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    placeholder="e.g., my-product-name"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Short Description *</label>
                                <Textarea
                                    required
                                    value={shortDescription}
                                    onChange={(e) => setShortDescription(e.target.value)}
                                    placeholder="Brief product description"
                                    className="min-h-20"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Full Description *</label>
                                <Textarea
                                    required
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Detailed product description"
                                    className="min-h-24"
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">Status *</label>
                                    <Select value={status} onValueChange={setStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="draft">Draft</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">Original Price *</label>
                                    <Input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={originalPrice}
                                        onChange={(e) => setOriginalPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-foreground">Discounted Price</label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        value={discountedPrice}
                                        onChange={(e) => setDiscountedPrice(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-foreground">Warranty Information *</label>
                                <Input
                                    required
                                    value={warranty}
                                    onChange={(e) => setWarranty(e.target.value)}
                                    placeholder="e.g., 1 Year Warranty"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Product Images */}
                    <section className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-6 text-xl font-semibold text-foreground">Product Images</h2>

                        {/* Image Upload */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-foreground mb-3">Upload Images</label>
                            <div className="relative rounded-lg border-2 border-dashed border-border p-6 text-center hover:border-primary/50 transition-colors">
                                <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground mb-2">Drag and drop images here, or click to select</p>
                                <input
                                    key={imageInputKey}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 cursor-pointer opacity-0"
                                />
                                <Button type="button" variant="outline" size="sm">
                                    Select Images
                                </Button>
                            </div>
                        </div>

                        {/* Uploaded Images */}
                        {images.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-foreground">Uploaded Images ({images.length})</h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {images.map((image) => (
                                        <div key={image.id} className="rounded-lg border border-border overflow-hidden">
                                            <div className="relative aspect-square overflow-hidden bg-muted">
                                                <img
                                                    src={image.preview || "/placeholder.svg"}
                                                    alt={image.altText || "Product"}
                                                    className="h-full w-full object-cover"
                                                />
                                                {image.isPrimary && (
                                                    <div className="absolute top-2 right-2">
                                                        <Badge className="bg-primary">Primary</Badge>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="space-y-3 p-3">
                                                <div>
                                                    <label className="mb-2 block text-xs font-medium text-foreground">Alt Text</label>
                                                    <Input
                                                        type="text"
                                                        value={image.altText}
                                                        onChange={(e) => {
                                                            setImages(
                                                                images.map((img) => (img.id === image.id ? { ...img, altText: e.target.value } : img)),
                                                            )
                                                        }}
                                                        placeholder="Describe the image"
                                                        className="text-xs"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={image.isPrimary}
                                                        onCheckedChange={() => setPrimaryImage(image.id)}
                                                        id={`primary-${image.id}`}
                                                    />
                                                    <label
                                                        htmlFor={`primary-${image.id}`}
                                                        className="text-xs font-medium text-foreground cursor-pointer"
                                                    >
                                                        Set as primary
                                                    </label>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeImage(image.id)}
                                                    className="w-full"
                                                >
                                                    <X className="mr-1 h-3 w-3" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Product Details */}
                    <section className="rounded-lg border border-border bg-card p-6">
                        <h2 className="mb-6 text-xl font-semibold text-foreground">Product Details</h2>

                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Textarea
                                    value={detailText}
                                    onChange={(e) => setDetailText(e.target.value)}
                                    placeholder="Enter a product detail point..."
                                    className="min-h-16 flex-1"
                                />
                                <Button type="button" onClick={addDetail} className="self-end bg-primary hover:bg-primary/90">
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add
                                </Button>
                            </div>

                            {details.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-border">
                                    <p className="text-sm font-medium text-foreground">Details ({details.length})</p>
                                    <div className="space-y-2">
                                        {details.map((detail) => (
                                            <div
                                                key={detail.id}
                                                className="flex items-start justify-between gap-3 rounded-md bg-muted/30 p-3"
                                            >
                                                <p className="flex-1 text-sm text-foreground">• {detail.text}</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeDetail(detail.id)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Color Variants */}
                    <section className="rounded-lg border border-border bg-card p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground">Color Variants</h2>
                            <Button type="button" onClick={addColorVariant} className="gap-2 bg-primary hover:bg-primary/90">
                                <Plus className="h-4 w-4" />
                                Add Variant
                            </Button>
                        </div>

                        {colorVariants.length > 0 ? (
                            <div className="space-y-4">
                                {colorVariants.map((variant) => (
                                    <div key={variant.id} className="rounded-lg border border-border">
                                        {/* Variant Header */}
                                        <button
                                            type="button"
                                            onClick={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}
                                            className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center gap-3 flex-1 text-left">
                                                <div
                                                    className="h-8 w-8 rounded-full border-2 border-border"
                                                    style={{ backgroundColor: variant.colorHex }}
                                                />
                                                <div>
                                                    <p className="font-medium text-foreground">{variant.colorName || "Color Variant"}</p>
                                                    <p className="text-xs text-muted-foreground">{variant.sizes.length} sizes</p>
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    removeColorVariant(variant.id)
                                                }}
                                                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </button>

                                        {/* Variant Details */}
                                        {expandedVariant === variant.id && (
                                            <div className="border-t border-border p-4 space-y-4">
                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-foreground">Color Name *</label>
                                                        <Input
                                                            value={variant.colorName}
                                                            onChange={(e) => updateColorVariant(variant.id, "colorName", e.target.value)}
                                                            placeholder="e.g., Red, Blue"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="mb-2 block text-sm font-medium text-foreground">Color Picker *</label>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="color"
                                                                value={variant.colorHex}
                                                                onChange={(e) => updateColorVariant(variant.id, "colorHex", e.target.value)}
                                                                className="h-9 w-16 cursor-pointer rounded-md border border-border"
                                                            />
                                                            <Input
                                                                value={variant.colorHex}
                                                                onChange={(e) => updateColorVariant(variant.id, "colorHex", e.target.value)}
                                                                placeholder="#000000"
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sizes */}
                                                <div className="border-t border-border pt-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <h4 className="font-medium text-foreground">Available Sizes</h4>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => addSizeToVariant(variant.id)}
                                                            className="gap-1"
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                            Add Size
                                                        </Button>
                                                    </div>

                                                    {variant.sizes.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {variant.sizes.map((size) => (
                                                                <div key={size.id} className="flex gap-2 items-end">
                                                                    <div className="flex-1">
                                                                        <label className="mb-1 block text-xs font-medium text-foreground">Size</label>
                                                                        <Input
                                                                            required
                                                                            value={size.size}
                                                                            onChange={(e) => updateSize(variant.id, size.id, "size", e.target.value)}
                                                                            placeholder="e.g., S, M, L, XL"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <label className="mb-1 block text-xs font-medium text-foreground">Quantity</label>
                                                                        <Input
                                                                            type="number"
                                                                            min="0"
                                                                            required
                                                                            value={size.quantity}
                                                                            onChange={(e) =>
                                                                                updateSize(
                                                                                    variant.id,
                                                                                    size.id,
                                                                                    "quantity",
                                                                                    Number.parseInt(e.target.value) || 0,
                                                                                )
                                                                            }
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeSize(variant.id, size.id)}
                                                                        className="h-9 w-9 p-0 hover:bg-destructive/10 hover:text-destructive"
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">No sizes added yet</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-lg border border-dashed border-border p-6 text-center">
                                <p className="text-sm text-muted-foreground mb-4">No color variants added yet</p>
                                <Button type="button" onClick={addColorVariant} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add First Variant
                                </Button>
                            </div>
                        )}
                    </section>

                    {/* Form Actions */}
                    <div className="flex gap-3 justify-end">
                        <Button type="button" variant="outline">
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                            Update Product
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
