import React, { useState } from 'react';
import { ShoppingCart, Star, ZoomIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import RecommendedCard from '@/components/RecommendedCard';

export default function ProductPage() {
    const [ selectedImage, setSelectedImage ] = useState(0);
    const [ selectedColor, setSelectedColor ] = useState('black');
    const [ selectedSize, setSelectedSize ] = useState('L');
    const [ quantity, setQuantity ] = useState(1);
    const [ isZoomed, setIsZoomed ] = useState(false);
    const [ zoomPosition, setZoomPosition ] = useState({ x: 0, y: 0 });
    const [ hoveredCardId, setHoveredCardId ] = useState<null | number>(null);

    const images = [
        '/1.webp',
        '/2.webp',
        '/3.jpg'
    ];

    const colors = [
        { name: 'Navy', value: 'navy', hex: '#1e3a8a' },
        { name: 'Green', value: 'green', hex: '#16a34a' },
        { name: 'Brown', value: 'brown', hex: '#78350f' },
        { name: 'Black', value: 'black', hex: '#000000' }
    ];

    const sizes = [ 'M', 'L', 'XXL' ];

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(Math.max(1, Math.min(5, quantity + delta)));
    };

    return (
        <div className="min-h-screen bg-white p-4 md:p-8 font-[Inter]">
            <div className="max-w-7xl mx-auto overflow-hidden">
                <div className="grid md:grid-cols-2 gap-8 p-6 md:p-10">
                    {/* Image Gallery Section */}
                    <div className="space-y-4">
                        {/* Main Image with Zoom */}
                        <div
                            className="relative bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
                            onMouseEnter={() => setIsZoomed(true)}
                            onMouseLeave={() => setIsZoomed(false)}
                            onMouseMove={handleMouseMove}
                        >
                            <div className="aspect-[10/11] relative">
                                <img
                                    src={images[ selectedImage ]}
                                    alt="Product"
                                    className="w-full h-full object-cover"
                                    style={isZoomed ? {
                                        transform: 'scale(3)',
                                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                                        transition: 'transform 0.1s ease-out'
                                    } : {}}
                                />
                                {!isZoomed && (
                                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                                        <ZoomIn className="w-5 h-5 text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="grid grid-cols-5 gap-3">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`aspect-[4/5] rounded-sm overflow-hidden border-2 transition-all ${selectedImage === idx
                                        ? 'border-accent ring-2 ring-accent'
                                        : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <img
                                        src={img}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Details Section */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                                Classic Black Tee
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex">
                                    {[ 1, 2, 3, 4 ].map((star) => (
                                        <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    <Star className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="text-gray-600">4.5 (134)</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-3xl font-extrabold text-green-600">NPR. 1099</span>
                                <span className="text-xl text-foreground/80 font-bold line-through">NPR. 1599</span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-800 leading-relaxed">
                                Crafted from 100% organic cotton, this premium t-shirt offers unparalleled
                                comfort and style. The soft, breathable fabric ensures all-day comfort while
                                maintaining its shape and color wash after wash.
                            </p>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <label className="block text-md  font-semibold text-gray-900 mb-3">
                                Color: {colors.find(c => c.value === selectedColor)?.name}
                            </label>
                            <div className="flex gap-3">
                                {colors.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => setSelectedColor(color.value)}
                                        className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColor === color.value
                                            ? 'border-gray-800 ring-2 ring-accent ring-offset-2'
                                            : 'border-gray-300 hover:border-gray-500'
                                            }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Size: {selectedSize}
                            </label>
                            <div className="flex gap-3">
                                {sizes.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-6 py-1 rounded-sm border-2 font-medium transition-all ${selectedSize === size
                                            ? 'border-foreground bg-foreground text-white'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-500'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Quantity:
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        -
                                    </button>
                                    <span className="px-6 py-2 font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 font-bold"
                                    >
                                        +
                                    </button>
                                </div>
                                <span className="text-green-600 font-medium">In Stock (5)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button className="cursor-pointer flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-800 text-gray-800 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                                Add To Cart
                            </button>
                            <button className="cursor-pointer px-6 py-4 bg-accent text-foreground font-bold rounded-sm hover:bg-accent/90 transition-colors">
                                Buy Now
                            </button>
                        </div>
                    </div>
                </div>

                <section className='px-6 pt-6 md:px-10 md:pt-10'>
                    <Tabs defaultValue="details" className="w-full">
                        <TabsList className='w-full bg-transparent'>
                            <TabsTrigger className='text-foreground text-md data-[state=active]:bg-foreground data-[state=active]:text-white font-semibold rounded-sm py-5' value="details">Details</TabsTrigger>
                            <TabsTrigger className='text-foreground text-md data-[state=active]:bg-foreground data-[state=active]:text-white font-semibold rounded-sm py-5' value="reviews">Reviews</TabsTrigger>
                            <TabsTrigger className='text-foreground text-md data-[state=active]:bg-foreground data-[state=active]:text-white font-semibold rounded-sm py-5' value="shipping">Shipping</TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className=' px-4 pt-10'>
                            <h2 className='text-2xl font-semibold '>Product Details</h2>
                            <ul className='py-4 px-10 list-disc text-lg leading-loose'>
                                <li>100% premium combed cotton (soft-touch, breathable)</li>
                                <li>Tailored fit for comfort + modern silhouette</li>
                                <li>Fade-resistant deep black color</li>
                                <li>Lightweight yet durable (180 GSM fabric)</li>
                                <li>Hand-finished stitching for premium feel</li>
                                <li>Customizable with personal monogram (optional)</li>
                            </ul>
                        </TabsContent>
                    </Tabs>
                </section>


            </div>
            <hr className='my-4 mx-4 md:mx-8 h-1 sm:h-[4px] bg-accent' />
            <section className='max-w-7xl mx-auto bg-red-500/0 my-4'>
                <Carousel className='w-full bg-yellow-500/0' opts={{ align: 'start' }}>
                    <CarouselContent>
                        {Array.from({ length: 7 }).map((_, idx) => (
                            <CarouselItem className='basis-[43%] lg:basis-1/3 xl:basis-1/4'><RecommendedCard id={idx} setHoveredCardId={setHoveredCardId} isHovered={hoveredCardId == idx} /></CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className='hidden 2xl:inline-flex rounded-sm p-6 border-1 border-foreground text-foreground -translate-x-4' />
                    <CarouselNext className='hidden 2xl:inline-flex rounded-sm p-6 border-1 border-foreground text-foreground ml-4 translate-x-4' />
                </Carousel>
            </section>
        </div>
    );
}