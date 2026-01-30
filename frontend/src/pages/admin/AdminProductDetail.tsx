'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAdminProductDetailBySlug } from "@/hooks/useAdminProducts";
import { groupProductVariants } from "@/service/utilsService";
import type { ModifiedProductVariant, ProductImage } from "@/type/product";
import { formatDistanceToNow } from "date-fns";
import { Check, Edit, Heart, MessageSquare, Package, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

const product = {
    reviews: [
        {
            id: 'review_001',
            userName: 'Sarah Anderson',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            rating: 5,
            title: 'Best t-shirt I own!',
            content: 'The quality is amazing. Comfortable, breathable, and the color has held up perfectly after several washes.',
            imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80',
            date: new Date('2024-11-15'),
        },
        {
            id: 'review_002',
            userName: 'Michael Chen',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
            rating: 4,
            title: 'Great value for the price',
            content: 'Exactly what I was looking for. Fits well, feels premium. Only minor complaint is it takes a while to shrink to the perfect fit.',
            imageUrl: null,
            date: new Date('2024-11-10'),
        },
        {
            id: 'review_003',
            userName: 'Jessica Martinez',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
            rating: 5,
            title: 'Perfect everyday shirt',
            content: 'I bought three colors and wear them constantly. The organic cotton is so soft and gentle on my sensitive skin. Highly recommend!',
            imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&q=80',
            date: new Date('2024-11-08'),
        },
        {
            id: 'review_004',
            userName: 'David Williams',
            userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
            rating: 4,
            title: 'Solid choice',
            content: 'Good quality t-shirt. Fit is as expected, colors are vibrant. Would definitely order again.',
            imageUrl: null,
            date: new Date('2024-11-05'),
        },
    ],
};

export default function ProductDetailPage() {
    const [ selectedImage, setSelectedImage ] = useState<ProductImage>({} as ProductImage);
    const [ selectedColor, setSelectedColor ] = useState<ModifiedProductVariant>({} as ModifiedProductVariant);
    const [ productVariants, setProductVariants ] = useState<ModifiedProductVariant[]>([])
    const { slug } = useParams()
    const {
        data: productInfoData,
        isFetching: isProductInfoFetching,
        isError: isProductInfoError,
        isLoading: isProductInfoLoading,
        error: productInfoError
    } = useAdminProductDetailBySlug(slug || "")

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    useEffect(() => {
        if (!productInfoData)
            return;

        const groupedVariants = groupProductVariants(productInfoData.variants);
        setProductVariants(groupedVariants)
        setSelectedColor(groupedVariants[ 0 ])

    }, [ productInfoData ])


    if (isProductInfoError) {
        console.error(productInfoError);
        return (
            <div>Error!!</div>
        )
    }

    if (!productInfoData || isProductInfoLoading || !selectedColor.sizes)
        return (
            <div>Loading...</div>
        )

    const statCards = [
        {
            label: 'Total Sold',
            value: productInfoData.sold_count.toLocaleString(),
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: "border-blue-500"
        },
        {
            label: 'Average Rating',
            value: Number(productInfoData.average_rating).toFixed(1),
            icon: Star,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: "border-yellow-500"
        },
        {
            label: 'Total Reviews',
            value: productInfoData.review_count.toLocaleString(),
            icon: MessageSquare,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: "border-purple-500"
        },
        {
            label: 'Available Stock',
            value: productInfoData.variants.reduce((prev, variant) => prev + variant.available, 0).toLocaleString(),
            icon: Package,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: "border-green-500"
        },
    ];

    // const productVariants = groupProductVariants(productInfoData.variants)

    return (
        <main className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="border-b border-border/50 bg-background">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Title and Actions */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{productInfoData.name}</h1>
                            <p className="text-sm text-muted-foreground mt-1">SKU: {productInfoData.product_sku}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent" asChild>
                                <Link to={`/admin/products/edit/${slug}`}>

                                    <Edit className="w-4 h-4" />
                                    Edit
                                </Link>
                            </Button>
                            <Button variant="destructive" size="sm" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div>Slug: <span className="text-foreground font-medium">{productInfoData.slug}</span></div>
                        <div>
                            Status:
                            <span className="inline-block ml-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 font-medium">
                                {productInfoData.status.charAt(0).toUpperCase() + productInfoData.status.slice(1)}
                            </span>
                        </div>
                        <div>Created: <span className="text-foreground font-medium">{formatDate(new Date(productInfoData.created_at))}</span></div>
                        <div>Updated: <span className="text-foreground font-medium">{formatDate(new Date(productInfoData.updated_at))}</span></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={stat.label} className={`p-6 border ${stat.borderColor}`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-muted-foreground text-xs font-medium">{stat.label}</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                                    </div>
                                    <Icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Images and Pricing Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="overflow-hidden border-0 shadow-none">
                        {/* Main Image */}
                        <div className="bg-muted aspect-square flex items-center justify-center relative overflow-hidden">
                            <img
                                src={selectedImage.url || "/placeholder.svg"}
                                alt={selectedImage.alt_text}
                                // fill
                                className="object-cover"
                            />
                            {selectedImage.is_primary && (
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail List */}
                        <div className="p-4 border-t border-border/40">
                            <p className="text-sm font-semibold text-foreground mb-3">Images</p>
                            <div className="grid grid-cols-4 gap-2">
                                {productInfoData.images.map((img, idx) => (
                                    <button
                                        key={img.alt_text + idx}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded overflow-hidden border transition-all ${selectedImage === img
                                            ? 'border-primary'
                                            : 'border-border/50 hover:border-primary/50'
                                            }`}
                                    >
                                        <img
                                            src={img.url || "/placeholder.svg"}
                                            alt={img.alt_text}
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image Details */}
                        <div className="px-4 py-3 border-t border-border/40 text-xs">
                            <p className="text-muted-foreground mb-1">
                                <span className="font-semibold">Alt:</span> {selectedImage.alt_text}
                            </p>
                            <p className="text-muted-foreground">
                                <span className="font-semibold">Type:</span> {selectedImage.is_primary ? 'Primary' : 'Secondary'}
                            </p>
                        </div>
                    </Card>
                    <div className="space-y-4">
                        <Card className="p-6 border-0 shadow-none">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Pricing</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Current Price</span>
                                    <span className="text-xl font-bold text-foreground">
                                        ${Number(productInfoData.original_price).toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Discounted Price</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-green-600">
                                            ${Number(productInfoData.current_price).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                    <span className="text-muted-foreground">Savings</span>
                                    <span className="font-semibold text-green-600">
                                        ${(Number(productInfoData.original_price) - Number(productInfoData.current_price)).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 border-0 shadow-none">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Color Variants</h3>

                            {/* Color Selection */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                {productVariants.map((variant) => (
                                    <button
                                        key={variant.variant_id}
                                        onClick={() => setSelectedColor(variant)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm ${selectedColor.variant_id === variant.variant_id
                                            ? 'bg-primary/10 border border-primary'
                                            : 'border border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: variant.hex_color }}
                                        />
                                        <span className="font-medium">{variant.color}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Color Details */}
                            <div className="pt-4 border-t border-border/40">
                                <div className="text-sm text-muted-foreground mb-3">Sizes for {selectedColor.color}</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {selectedColor.sizes.map((size) => (
                                        <div key={size.size} className="flex flex-col gap-1 p-2 bg-muted/30 rounded">
                                            <span className="font-semibold text-sm">{size.size}</span>
                                            {/* <span className="text-xs text-muted-foreground">${size.price.toFixed(2)}</span> */}
                                            <span className={`text-xs font-medium ${size.available > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {size.available} in stock
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Card className="p-6 border-0 shadow-none">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <p className="font-bold mb-1">Warranty Info</p>
                                        <p className="font-semibold text-foreground">{productInfoData.warranty_info}</p>
                                    </div>
                                </div>
                            </Card>
                        </Card>
                    </div>
                </div>

                {/* Description Section */}
                <Card className="p-8 shadow-none border-none">
                    <div className="space-y-6">
                        {/* Short Description */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Summary</h4>
                            <p className="text-muted-foreground leading-relaxed">{productInfoData.short_description}</p>
                        </div>

                        {/* Long Description */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Full Description</h4>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {productInfoData.description}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Details Grid */}
                <div className="grid grid-cols-1 gap-6">

                    <Card className="p-8 border-none shadow-none">
                        <h3 className="text-xl font-semibold text-foreground mb-6">Product Details</h3>

                        <ul className="space-y-3">
                            {productInfoData.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground">{detail.text}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>

                {/* Reviews Section */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Customer Reviews</h3>
                        <p className="text-sm text-muted-foreground">
                            {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Comments List */}
                        <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-amber-50/0 scrollbar-thumb-accent/70">
                            {product.reviews.map((review) => (
                                <div
                                    className="group flex gap-3 pb-4 border-b border-border/50 last:border-b-0"
                                >
                                    {/* Avatar */}
                                    <Avatar className="h-10 w-10 flex-shrink-0">
                                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                                        <AvatarFallback>{review.userName}</AvatarFallback>
                                    </Avatar>

                                    {/* Comment Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-semibold text-sm text-foreground">{review.userName}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDistanceToNow(review.date, { addSuffix: true })}
                                                    </p>
                                                    {true && <p className="text-xs rounded-full text-green-500">verified purchase</p>}

                                                </div>
                                            </div>

                                            {/* Like Button & Menu */}
                                            <div className="flex items-center gap-2 transition-opacity">
                                                <button
                                                    // onClick={() => onLike(comment.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border hover:bg-secondary transition-colors"
                                                >
                                                    <Heart
                                                        size={16}
                                                        // className={`transition-colors ${false ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
                                                        className={`transition-colors text-muted-foreground`}
                                                    />
                                                    <span className="text-xs font-medium text-foreground">{10}</span>
                                                </button>

                                            </div>
                                        </div>

                                        {/* Comment Text */}
                                        <p className="text-sm text-foreground mt-2 leading-relaxed">{review.content}</p>

                                        {/* Comment Image */}
                                        {true && (
                                            <div className="mt-3 overflow-hidden">
                                                <img
                                                    src={review.imageUrl || "/placeholder.svg"}
                                                    alt={"alt text"}
                                                    className="max-h-48 object-cover rounded-lg"
                                                />
                                            </div>
                                        )}
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
