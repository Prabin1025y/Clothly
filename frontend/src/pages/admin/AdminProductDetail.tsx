import { useState } from 'react';
import { Star, Edit2, Trash2, Package, TrendingUp, Image as ImageIcon, CheckCircle, XCircle, AlertCircle, DollarSign, Eye, Calendar, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Sample product data
const sampleProduct = {
    name: "Premium Leather Backpack",
    sku: "PLB-2024-001",
    slug: "premium-leather-backpack",
    status: "active",
    description: "Crafted from full-grain Italian leather, this premium backpack combines timeless elegance with modern functionality. Featuring multiple compartments, reinforced stitching, and water-resistant coating, it's designed for the discerning professional who demands both style and substance. Each piece is carefully constructed by master artisans, ensuring exceptional quality and durability that only improves with age.",
    shortDescription: "Handcrafted Italian leather backpack with premium hardware and lifetime warranty",
    warrantyInfo: "Lifetime warranty covering manufacturing defects. 30-day satisfaction guarantee. Free repairs for life.",
    rating: 4.7,
    reviewCount: 328,
    soldCount: 1247,
    originalPrice: 399.00,
    discountedPrice: 299.00,
    createdAt: "2024-01-15",
    lastUpdated: "2024-12-20",
    images: [
        { url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800", alt: "Front view of premium leather backpack", isPrimary: true },
        { url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800", alt: "Side profile showing compartments", isPrimary: false },
        { url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800", alt: "Interior view with laptop compartment", isPrimary: false },
        { url: "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=800", alt: "Detail of leather texture and stitching", isPrimary: false }
    ],
    details: [
        "Full-grain Italian vegetable-tanned leather",
        "Dedicated 15-inch laptop compartment with padded protection",
        "YKK brass zippers with leather pulls",
        "Adjustable ergonomic shoulder straps with memory foam padding",
        "Hidden back pocket for valuables",
        "Water-resistant canvas lining",
        "Multiple interior organizer pockets",
        "Reinforced base with protective feet"
    ],
    variants: [
        {
            color: "Cognac Brown",
            colorHex: "#8B4513",
            sizes: [
                { size: "Standard", stock: 45 },
                { size: "Large", stock: 23 }
            ]
        },
        {
            color: "Black",
            colorHex: "#1a1a1a",
            sizes: [
                { size: "Standard", stock: 67 },
                { size: "Large", stock: 34 }
            ]
        },
        {
            color: "Navy Blue",
            colorHex: "#001f3f",
            sizes: [
                { size: "Standard", stock: 12 },
                { size: "Large", stock: 8 }
            ]
        }
    ]
};

export default function AdminProductDisplay() {
    const [ product ] = useState(sampleProduct);
    const [ selectedImage, setSelectedImage ] = useState(0);

    const discountPercentage = Math.round(((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100);
    const totalStock = product.variants.reduce((total, variant) =>
        total + variant.sizes.reduce((sum, size) => sum + size.stock, 0), 0
    );

    const handleEdit = () => {
        console.log('Edit product:', product.sku);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            console.log('Delete product:', product.sku);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-[Inter]">
            <div className="max-w-[1600px] mx-auto p-4 md:p-8">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <h1 className="text-3xl md:text-5xl font-bold text-gray-900">
                                    {product.name}
                                </h1>
                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${product.status === 'active'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-red-100 text-red-700 border border-red-200'
                                    }`}>
                                    {product.status === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                    {product.status.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</p>
                                    <p className="text-sm font-bold text-gray-900">{product.sku}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</p>
                                    <p className="text-sm font-medium text-gray-700">{product.slug}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</p>
                                    <p className="text-sm font-medium text-gray-700">{product.createdAt}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Updated</p>
                                    <p className="text-sm font-medium text-gray-700">{product.lastUpdated}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-6 py-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg"
                            >
                                <Edit2 className="w-5 h-5" />
                                Edit Product
                            </Button>
                            <Button
                                onClick={handleDelete}
                                variant="outline"
                                className="flex items-center gap-2 px-6 py-6 bg-white border-2 border-red-500 text-red-500 font-semibold rounded-lg hover:bg-red-50 transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <Tag className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-blue-900 mb-1">{product.soldCount.toLocaleString()}</p>
                        <p className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Units Sold</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                                <Star className="w-6 h-6 text-white fill-white" />
                            </div>
                            <Eye className="w-5 h-5 text-yellow-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-yellow-900 mb-1">{product.rating}</p>
                        <p className="text-sm font-semibold text-yellow-700 uppercase tracking-wide">Average Rating</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-green-900 mb-1">{totalStock}</p>
                        <p className="text-sm font-semibold text-green-700 uppercase tracking-wide">Total Stock</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                            <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <p className="text-3xl font-extrabold text-purple-900 mb-1">{product.reviewCount}</p>
                        <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Total Reviews</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-6 mb-6">
                    {/* Image Gallery */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5" />
                            Product Images
                        </h2>

                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[10/11]">
                                <img
                                    src={product.images[ selectedImage ].url}
                                    alt={product.images[ selectedImage ].alt}
                                    className="w-full h-full object-cover"
                                />
                                {product.images[ selectedImage ].isPrimary && (
                                    <div className="absolute top-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                                        Primary
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="grid grid-cols-5 gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`aspect-[4/5] rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx
                                            ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                                            : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt={img.alt}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            {/* Image Alt Texts */}
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Image Alt Text</p>
                                <p className="text-sm text-gray-700 font-medium">{product.images[ selectedImage ].alt}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        {/* Pricing */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" />
                                Pricing
                            </h2>

                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-extrabold text-green-600">NPR. {product.discountedPrice.toFixed(2)}</span>
                                    <span className="text-2xl text-gray-500 font-bold line-through">NPR. {product.originalPrice.toFixed(2)}</span>
                                </div>
                                <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                                    {discountPercentage}% OFF
                                </span>
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5" />
                                Rating & Reviews
                            </h2>

                            <div className="flex items-center gap-4">
                                <div className="flex">
                                    {Array.from({ length: Math.floor(product.rating) }).map((_, idx) => (
                                        <Star key={idx} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    {Array.from({ length: 5 - Math.floor(product.rating) }).map((_, idx) => (
                                        <Star key={`empty-${idx}`} className="w-6 h-6 text-gray-300" />
                                    ))}
                                </div>
                                <span className="text-2xl font-bold text-gray-900">{product.rating}</span>
                                <span className="text-gray-600 font-medium">({product.reviewCount} reviews)</span>
                            </div>
                        </div>

                        {/* Short Description */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm border-l-4 border-gray-900 p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">Short Description</h3>
                            <p className="text-base text-gray-700 font-medium leading-relaxed">{product.shortDescription}</p>
                        </div>

                        {/* Warranty */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Warranty Information
                            </h2>
                            <p className="text-gray-700 leading-relaxed">{product.warrantyInfo}</p>
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full bg-gray-100 p-1 rounded-lg">
                            <TabsTrigger
                                className="flex-1 text-gray-700 font-semibold rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all"
                                value="description"
                            >
                                Description
                            </TabsTrigger>
                            <TabsTrigger
                                className="flex-1 text-gray-700 font-semibold rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all"
                                value="details"
                            >
                                Details
                            </TabsTrigger>
                            <TabsTrigger
                                className="flex-1 text-gray-700 font-semibold rounded-md data-[state=active]:bg-gray-900 data-[state=active]:text-white transition-all"
                                value="variants"
                            >
                                Variants
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="description" className="pt-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Full Description</h3>
                            <p className="text-gray-700 leading-relaxed text-lg">{product.description}</p>
                        </TabsContent>

                        <TabsContent value="details" className="pt-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Product Details</h3>
                            <ul className="space-y-3">
                                {product.details.map((detail, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-gray-700">
                                        <span className="text-gray-900 font-bold mt-1">→</span>
                                        <span className="text-base leading-relaxed">{detail}</span>
                                    </li>
                                ))}
                            </ul>
                        </TabsContent>

                        <TabsContent value="variants" className="pt-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Color Variants & Stock</h3>
                            <div className="space-y-6">
                                {product.variants.map((variant, idx) => (
                                    <div key={idx} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                                        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-300">
                                            <div
                                                className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
                                                style={{ backgroundColor: variant.colorHex }}
                                            />
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">{variant.color}</h4>
                                                <p className="text-sm text-gray-600 font-medium">Hex: {variant.colorHex}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                            {variant.sizes.map((size, sizeIdx) => {
                                                const stockStatus = size.stock === 0 ? 'out' : size.stock < 20 ? 'low' : 'in';
                                                return (
                                                    <div
                                                        key={sizeIdx}
                                                        className={`rounded-lg p-4 border-2 text-center transition-all ${stockStatus === 'out'
                                                            ? 'bg-red-50 border-red-200'
                                                            : stockStatus === 'low'
                                                                ? 'bg-yellow-50 border-yellow-200'
                                                                : 'bg-green-50 border-green-200'
                                                            }`}
                                                    >
                                                        <p className="text-lg font-bold text-gray-900 mb-2">{size.size}</p>
                                                        <div className="flex items-center justify-center gap-2">
                                                            {stockStatus === 'out' ? (
                                                                <XCircle className="w-4 h-4 text-red-600" />
                                                            ) : stockStatus === 'low' ? (
                                                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                                            ) : (
                                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                            )}
                                                            <span className={`text-sm font-bold ${stockStatus === 'out'
                                                                ? 'text-red-700'
                                                                : stockStatus === 'low'
                                                                    ? 'text-yellow-700'
                                                                    : 'text-green-700'
                                                                }`}>
                                                                {size.stock} in stock
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}