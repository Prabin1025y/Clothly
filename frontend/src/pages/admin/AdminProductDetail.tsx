'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Edit, MessageSquare, Package, ShoppingCart, Star, Trash2 } from "lucide-react";
import { useState } from "react";

const product = {
    id: 'prod_001',
    name: 'Premium Cotton Casual T-Shirt',
    sku: 'TSH-001-BLK-M',
    slug: 'premium-cotton-casual-tshirt',
    status: 'active',
    created: new Date('2024-01-15'),
    lastUpdated: new Date('2024-11-20'),

    stats: {
        soldCount: 1253,
        averageRating: 4.6,
        totalReviews: 184,
        totalStock: 456,
    },

    images: [
        {
            id: 'img_001',
            url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
            altText: 'Premium Cotton T-Shirt Front View',
            isPrimary: true,
        },
        {
            id: 'img_002',
            url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80',
            altText: 'Premium Cotton T-Shirt Back View',
            isPrimary: false,
        },
        {
            id: 'img_003',
            url: 'https://images.unsplash.com/photo-1506629082632-96b285a8e01f?w=800&q=80',
            altText: 'Premium Cotton T-Shirt Detail View',
            isPrimary: false,
        },
        {
            id: 'img_004',
            url: 'https://images.unsplash.com/photo-1469028065105-ce4fa1fc9e0d?w=800&q=80',
            altText: 'Premium Cotton T-Shirt Lifestyle',
            isPrimary: false,
        },
    ],

    pricing: {
        currentPrice: 29.99,
        discountedPrice: 19.99,
        discount: 33,
    },

    shortDescription:
        'A versatile, premium quality cotton t-shirt perfect for everyday wear. Made from 100% organic cotton with a comfortable fit.',

    longDescription:
        'Our Premium Cotton Casual T-Shirt is crafted from the finest 100% organic cotton, ensuring supreme comfort and breathability. The fabric is pre-shrunk and durable, maintaining its shape and color after multiple washes. With a classic crew neck design and reinforced stitching, this t-shirt is perfect for casual outings, lounging at home, or layering with other pieces. Available in multiple colors and sizes, it\'s a wardrobe essential that pairs well with jeans, shorts, or joggers. Whether you\'re running errands or hanging out with friends, this t-shirt delivers both style and comfort.',

    colorVariants: [
        {
            id: 'color_001',
            name: 'Black',
            hex: '#000000',
            sizes: [
                { size: 'XS', inStock: 12, price: 19.99 },
                { size: 'S', inStock: 28, price: 19.99 },
                { size: 'M', inStock: 45, price: 19.99 },
                { size: 'L', inStock: 38, price: 19.99 },
                { size: 'XL', inStock: 22, price: 19.99 },
                { size: '2XL', inStock: 8, price: 22.99 },
            ],
        },
        {
            id: 'color_002',
            name: 'White',
            hex: '#FFFFFF',
            sizes: [
                { size: 'XS', inStock: 15, price: 19.99 },
                { size: 'S', inStock: 32, price: 19.99 },
                { size: 'M', inStock: 52, price: 19.99 },
                { size: 'L', inStock: 41, price: 19.99 },
                { size: 'XL', inStock: 26, price: 19.99 },
                { size: '2XL', inStock: 10, price: 22.99 },
            ],
        },
        {
            id: 'color_003',
            name: 'Navy',
            hex: '#001F3F',
            sizes: [
                { size: 'XS', inStock: 10, price: 19.99 },
                { size: 'S', inStock: 24, price: 19.99 },
                { size: 'M', inStock: 38, price: 19.99 },
                { size: 'L', inStock: 32, price: 19.99 },
                { size: 'XL', inStock: 18, price: 19.99 },
                { size: '2XL', inStock: 5, price: 22.99 },
            ],
        },
        {
            id: 'color_004',
            name: 'Heather Gray',
            hex: '#A8A8A8',
            sizes: [
                { size: 'XS', inStock: 8, price: 19.99 },
                { size: 'S', inStock: 20, price: 19.99 },
                { size: 'M', inStock: 35, price: 19.99 },
                { size: 'L', inStock: 28, price: 19.99 },
                { size: 'XL', inStock: 14, price: 19.99 },
                { size: '2XL', inStock: 3, price: 22.99 },
            ],
        },
    ],

    warranty: {
        duration: '1 Year',
        coverage: [ 'Manufacturing defects', 'Stitching issues', 'Color fading' ],
        exclusions: [ 'Normal wear and tear', 'Damage from improper care', 'Stains or bleach damage' ],
    },

    details: [
        'Material: 100% Organic Cotton',
        'Weight: 165 GSM',
        'Fit: Classic Unisex Fit',
        'Care: Machine wash cold, gentle cycle',
        'Dimensions: See size chart for measurements',
        'Made in Portugal with sustainable practices',
    ],

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

const statCards = [
    {
        label: 'Total Sold',
        value: product.stats.soldCount.toLocaleString(),
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: "border-blue-500"
    },
    {
        label: 'Average Rating',
        value: product.stats.averageRating.toFixed(1),
        icon: Star,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: "border-yellow-500"
    },
    {
        label: 'Total Reviews',
        value: product.stats.totalReviews.toLocaleString(),
        icon: MessageSquare,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: "border-purple-500"
    },
    {
        label: 'Available Stock',
        value: product.stats.totalStock.toLocaleString(),
        icon: Package,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: "border-green-500"
    },
];

export default function ProductDetailPage() {
    const [ selectedImage, setSelectedImage ] = useState(product.images[ 0 ]);
    const [ selectedColor, setSelectedColor ] = useState(product.colorVariants[ 0 ]);

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-background">
            {/* Header Section */}
            <div className="border-b border-border/50 bg-background">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    {/* Title and Actions */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
                            <p className="text-sm text-muted-foreground mt-1">SKU: {product.sku}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                            <Button variant="destructive" size="sm" className="gap-2">
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div>Slug: <span className="text-foreground font-medium">{product.slug}</span></div>
                        <div>
                            Status:
                            <span className="inline-block ml-1 px-2 py-0.5 rounded text-xs bg-green-100 text-green-800 font-medium">
                                {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                            </span>
                        </div>
                        <div>Created: <span className="text-foreground font-medium">{formatDate(product.created)}</span></div>
                        <div>Updated: <span className="text-foreground font-medium">{formatDate(product.lastUpdated)}</span></div>
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
                                alt={selectedImage.altText}
                                // fill
                                className="object-cover"
                            />
                            {selectedImage.isPrimary && (
                                <div className="absolute top-3 left-3">
                                    <Badge className="bg-blue-600 text-white text-xs">Primary</Badge>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail List */}
                        <div className="p-4 border-t border-border/40">
                            <p className="text-sm font-semibold text-foreground mb-3">Images</p>
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(img)}
                                        className={`aspect-square rounded overflow-hidden border transition-all ${selectedImage.id === img.id
                                            ? 'border-primary'
                                            : 'border-border/50 hover:border-primary/50'
                                            }`}
                                    >
                                        <img
                                            src={img.url || "/placeholder.svg"}
                                            alt={img.altText}
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
                                <span className="font-semibold">Alt:</span> {selectedImage.altText}
                            </p>
                            <p className="text-muted-foreground">
                                <span className="font-semibold">Type:</span> {selectedImage.isPrimary ? 'Primary' : 'Secondary'}
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
                                        ${product.pricing.currentPrice.toFixed(2)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground">Discounted Price</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-xl font-bold text-green-600">
                                            ${product.pricing.discountedPrice.toFixed(2)}
                                        </span>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                            {product.pricing.discount}% OFF
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                                    <span className="text-muted-foreground">Savings</span>
                                    <span className="font-semibold text-green-600">
                                        ${(product.pricing.currentPrice - product.pricing.discountedPrice).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-6 border-0 shadow-none">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Color Variants</h3>

                            {/* Color Selection */}
                            <div className="mb-4 flex flex-wrap gap-2">
                                {product.colorVariants.map((variant) => (
                                    <button
                                        key={variant.id}
                                        onClick={() => setSelectedColor(variant)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all text-sm ${selectedColor.id === variant.id
                                            ? 'bg-primary/10 border border-primary'
                                            : 'border border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <div
                                            className="w-4 h-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: variant.hex }}
                                        />
                                        <span className="font-medium">{variant.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Selected Color Details */}
                            <div className="pt-4 border-t border-border/40">
                                <div className="text-sm text-muted-foreground mb-3">Sizes for {selectedColor.name}</div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {selectedColor.sizes.map((size) => (
                                        <div key={size.size} className="flex flex-col gap-1 p-2 bg-muted/30 rounded">
                                            <span className="font-semibold text-sm">{size.size}</span>
                                            <span className="text-xs text-muted-foreground">${size.price.toFixed(2)}</span>
                                            <span className={`text-xs font-medium ${size.inStock > 0 ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {size.inStock} in stock
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Description Section */}
                <Card className="p-8 shadow-none border-none">
                    <div className="space-y-6">
                        {/* Short Description */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Summary</h4>
                            <p className="text-muted-foreground leading-relaxed">{product.shortDescription}</p>
                        </div>

                        {/* Long Description */}
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">Full Description</h4>
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                                {product.longDescription}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="p-6 border-0 shadow-none">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Warranty Duration</p>
                                <p className="font-semibold text-foreground">{product.warranty.duration}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-8 border-none shadow-none">
                        <h3 className="text-xl font-semibold text-foreground mb-6">Product Details</h3>

                        <ul className="space-y-3">
                            {product.details.map((detail, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-foreground">{detail}</span>
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

                    <div className=" rounded-lg overflow-hidden h-96">
                        <div className="overflow-y-auto h-full space-y-3">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="pb-4 border-b border-border/30 last:border-b-0">
                                    {/* Review Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-start gap-3">
                                            <img
                                                src={review.userAvatar || "/placeholder.svg"}
                                                alt={review.userName}
                                                width={40}
                                                height={40}
                                                className="rounded-full"
                                            />
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{review.userName}</p>
                                                <p className="text-xs text-muted-foreground">{formatDate(review.date)}</p>
                                            </div>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>

                                    {/* Review Content */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-foreground mb-1">{review.title}</h4>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{review.content}</p>
                                    </div>

                                    {/* Review Image */}
                                    {review.imageUrl && (
                                        <div className="relative w-20 h-20 rounded mt-2 overflow-hidden bg-muted">
                                            <img
                                                src={review.imageUrl || "/placeholder.svg"}
                                                alt="Review image"
                                                className="object-cover"
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
