import React, { useEffect, useState } from 'react';
import { AlertOctagon, Loader, Loader2, ShoppingCart, Star, ZoomIn } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import RecommendedCard from '@/components/RecommendedCard';
import { useParams } from 'react-router';
import type { ModifiedProductVariant, ProductImage, RecommendedProduct } from '@/type/product';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import ProductPageSkeleton from '@/Skeletons/ProductDisplaySkeleton';
import { Button } from '@/components/ui/button';
import { useAddItemToCart } from '@/hooks/useCartItems';
import { productKeys, useGetProductInfo, useGetRecommendedProducts } from '@/hooks/useProducts';
import { groupProductVariants } from '@/service/utilsService';
import { useQueryClient } from '@tanstack/react-query';
import ReviewSection from '@/components/reviews/ReviewSection';

export default function ProductPage() {
    const [ selectedImage, setSelectedImage ] = useState<ProductImage>({} as ProductImage);
    const [ selectedColor, setSelectedColor ] = useState<ModifiedProductVariant>({} as ModifiedProductVariant);
    const [ selectedSize, setSelectedSize ] = useState<ModifiedProductVariant[ 'sizes' ][ number ]>({} as ModifiedProductVariant[ 'sizes' ][ number ]);
    const [ quantity, setQuantity ] = useState(1);
    const [ isZoomed, setIsZoomed ] = useState(false);
    const [ zoomPosition, setZoomPosition ] = useState({ x: 0, y: 0 });
    const [ hoveredCardId, setHoveredCardId ] = useState<null | number>(null);
    const [ colorVariant, setColorVariant ] = useState<ModifiedProductVariant[]>([])
    const [ isAddingToCart, setIsAddingToCart ] = useState(false);

    const { productId } = useParams();
    const addItemToCart = useAddItemToCart();
    const {
        data: productInfoData,
        isFetching: isProductInfoFetching,
        isError: isProductInfoError,
        isLoading: isProductInfoLoading,
        error: productInfoError
    } = useGetProductInfo(productId)
    const queryClient = useQueryClient();

    const recommendedQuery = useGetRecommendedProducts();


    const handleAddToCart = async () => {
        try {
            setIsAddingToCart(true);
            await addItemToCart.mutateAsync({
                variantId: selectedSize.variant_id,
                quantity: quantity,
                name: productInfo.name,
                slug: productInfo.slug,
                price: Number(productInfo.current_price),
                url: productInfo.primary_image.url,
                alt_text: productInfo.primary_image.alt_text
            })

        } catch (error) {
            console.error("Error occured!! Please try again.", error);
        } finally {
            setIsAddingToCart(false);
        }
    }

    const handleSelectedColorChange = (variant: ModifiedProductVariant) => {
        setSelectedColor(variant);

        if (!variant || !Array.isArray(variant.sizes)) return;
        const nextSelectedSize = variant.sizes[ 0 ]
        setSelectedSize(nextSelectedSize);

        if (!nextSelectedSize) return;
        setQuantity(Math.min(quantity, nextSelectedSize.available ?? 1));
    }

    const handleSelectedSizeChange = (size: ModifiedProductVariant[ 'sizes' ][ number ]) => {
        setSelectedSize(size);
        if (!size) return;
        setQuantity(Math.min(quantity, size.available ?? 1));
    }

    useEffect(() => {
        if (!productInfoData) return;
        setSelectedImage(productInfoData.primary_image);

        const nextColorVariant = groupProductVariants(productInfoData.variants);
        setColorVariant(nextColorVariant)

        if (nextColorVariant.length === 0) return;
        const nextSelectedColor = nextColorVariant[ 0 ]
        setSelectedColor(nextSelectedColor);

        if (!nextSelectedColor || !Array.isArray(nextSelectedColor.sizes)) return;
        const nextSelectedSize = nextSelectedColor.sizes[ 0 ]
        setSelectedSize(nextSelectedSize);

        if (!nextSelectedSize) return;
        setQuantity(Math.min(quantity, nextSelectedSize.available ?? 1));
    }, [ productInfoData ])


    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomPosition({ x, y });
    };

    const handleQuantityChange = (delta: number) => {
        setQuantity(Math.max(1, Math.min(selectedSize.available, quantity + delta)));
    };

    if (isProductInfoError) {
        console.error(productInfoError);
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
                    {(isProductInfoFetching && !isProductInfoLoading) ? <Button disabled className="bg-red-500">
                        <Loader2 className="animate-spin" /> Retrying...
                    </Button> : <Button
                        className="cursor-pointer bg-red-500"
                        onClick={() => queryClient.invalidateQueries({ queryKey: productKeys.detail(productId ?? "") })}
                    >
                        Retry
                    </Button>}
                </div>
            </EmptyContent>
        </Empty>
    }

    if (isProductInfoFetching || !productInfoData)
        return <ProductPageSkeleton />


    const productInfo = productInfoData;

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
                                    src={selectedImage?.url}
                                    alt={selectedImage?.alt_text}
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
                            {productInfo?.images?.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-[4/5] rounded-sm overflow-hidden border-2 transition-all ${selectedImage?.url === img?.url
                                        ? 'border-accent ring-2 ring-accent'
                                        : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                >
                                    <img
                                        src={img.url}
                                        alt={img.alt_text}
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
                                {productInfo?.name}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex">
                                    {Array.from({ length: Math.floor(Number(productInfo?.average_rating)) }).map((_, idx) => (
                                        <Star key={idx} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                    {Array.from({ length: 5 - Math.floor(Number(productInfo?.average_rating)) }).map((_, idx) => (
                                        <Star key={idx} className="w-5 h-5 text-gray-600" />
                                    ))}
                                </div>
                                <span className="text-gray-600">{productInfo.average_rating} ({productInfo.review_count})</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-3xl font-extrabold text-green-600">NPR. {productInfo.current_price}</span>
                                <span className="text-xl text-foreground/80 font-bold line-through">NPR. {productInfo.original_price}</span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-800 leading-relaxed">{productInfo.description}</p>
                        </div>

                        {/* Color Selection */}
                        <div>
                            <label className="block text-md  font-semibold text-gray-900 mb-3">
                                Color: {colorVariant.find(c => c.color === selectedColor.color)?.color}
                            </label>
                            <div className="flex gap-3">
                                {colorVariant.map((variant) => (
                                    <button
                                        key={variant.color}
                                        onClick={() => handleSelectedColorChange(variant)}
                                        className={`w-12 h-12 rounded-full border-2 transition-all ${selectedColor.color === variant.color
                                            ? 'border-gray-800 ring-2 ring-accent ring-offset-2'
                                            : 'border-gray-300 hover:border-gray-500'
                                            }`}
                                        style={{ backgroundColor: variant.hex_color }}
                                        title={variant.color}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Size: {selectedSize?.size}
                            </label>
                            <div className="flex gap-3">
                                {selectedColor?.sizes?.map((size, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelectedSizeChange(size)}
                                        className={`px-6 py-1 rounded-sm border-2 font-medium transition-all ${selectedSize.size === size.size
                                            ? 'border-foreground bg-foreground text-white'
                                            : 'border-gray-300 text-gray-700 hover:border-gray-500'
                                            }`}
                                    >
                                        {size.size}
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
                                <span className="text-green-600 font-medium">In Stock ({selectedSize.available})</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <Button disabled={isAddingToCart || quantity === 0} onClick={handleAddToCart} className={`cursor-pointer bg-white h-full font-semibold text-base flex items-center justify-center gap-2 px-6 border-2 ${(isAddingToCart || quantity === 0) ? "border-gray-800/50 text-gray-800/50" : "border-gray-800 text-gray-800"} font-bold rounded-lg hover:bg-gray-200 transition-colors`}>
                                {isAddingToCart ? <Loader className='w-5 h-5 animate-spin' /> : <ShoppingCart className="w-5 h-5" />}
                                Add To Cart
                            </Button>
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
                                {productInfo?.details?.map((detail, idx) => (
                                    <li key={idx}>{detail.text}</li>
                                ))}
                            </ul>
                        </TabsContent>
                        <TabsContent value="reviews" className="bg-card border border-border rounded-xl p-6 pt-10">
                            <ReviewSection productId={productInfo.id} />
                        </TabsContent>
                    </Tabs>
                </section>


            </div>
            <hr className='my-4 mx-4 md:mx-8 h-1 sm:h-[4px] bg-accent' />
            <section className='max-w-7xl mx-auto bg-red-500/0 my-4'>
                <Carousel className='w-full bg-yellow-500/0' opts={{ align: 'start' }}>
                    <CarouselContent>
                        {Array.isArray(recommendedQuery?.data) && recommendedQuery?.data?.filter((product: RecommendedProduct) => product.slug !== productId).map((product: RecommendedProduct, idx: number) => (
                            <CarouselItem key={idx} className='basis-[43%] lg:basis-1/3 xl:basis-1/4'>
                                <RecommendedCard id={idx} setHoveredCardId={setHoveredCardId} isHovered={hoveredCardId == idx} product={product} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className='hidden 2xl:inline-flex rounded-sm p-6 border-1 border-foreground text-foreground -translate-x-4' />
                    <CarouselNext className='hidden 2xl:inline-flex rounded-sm p-6 border-1 border-foreground text-foreground ml-4 translate-x-4' />
                </Carousel>
            </section>
        </div>
    );
}