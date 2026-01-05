import type { RecommendedProduct } from "@/type/product"
import { Star } from "lucide-react"
import { Link } from "react-router"

type RecommendedCardProps = {
    isHovered: boolean
    setHoveredCardId: React.Dispatch<React.SetStateAction<null | number>>
    id: number
    product: RecommendedProduct
}

const RecommendedCard = ({ id, isHovered = false, setHoveredCardId, product }: RecommendedCardProps) => {

    const handleMouseEnter = () => {
        setHoveredCardId(id);
    }

    const handleMouseLeave = () => {
        setHoveredCardId(null);
    }

    return (
        <div className=" rounded-3xl sm:w-[clamp(250px,300px,350px)] font-[Inter] cursor-pointer" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            {/* Image Container with shadow effect */}
            <div className="relative pt-8 px-8">
                <div className="relative">
                    {/* Shadow effect */}
                    {/* <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/40 blur-2xl rounded-full"></div> */}

                    {/* Product Image */}
                    <img
                        src={product.url}
                        alt={product.alt_text}
                        className={`min-w-[130%] h-40 sm:h-80 object-contain sm:object-cover absolute left-1/2 -translate-x-1/2 z-1 ${isHovered && "-translate-y-5 sm:-translate-y-10 animate-bounce animate-subtle-bounce"}  transition-transform duration-300`}
                    />
                </div>
            </div>

            {/* Card Content */}
            <div className={`${isHovered && "bg-gradient-to-b from-accent  to-white "} relative pt-20 sm:pt-40 pb-4 px-1 sm:px-4 text-center shadow-[13px_13px_22px_-20px_#c9a34b] sm:shadow-[13px_13px_33px_-15px_#c9a34b] mt-20 sm:mt-40 rounded-3xl transition-colors duration-300 `}>
                <div className={`${isHovered ? "opacity-100" : "opacity-0"} transition-opacity duration-300 w-[70%] -translate-y-[70px] sm:translate-y-0 translate-x-6 sm:translate-x-9 h-3 sm:h-4 bg-transparent shadow-[0px_133px_14px_0px_#000000] rounded-[100%] absolute top-0 `} />
                {/* Product Title */}
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {product.name}
                </h3>


                {/* Rating and Price Row */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-6">
                    {/* Rating */}
                    <div className={`flex items-center gap-2 transition-colors duration-300 px-2 py-1 rounded-full`}>
                        <div className="flex items-center">
                            {Array.from({ length: Math.floor(Number(product?.average_rating)) }).map((_, idx) => (
                                <Star key={idx} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                            {Array.from({ length: 5 - Math.floor(Number(product?.average_rating)) }).map((_, idx) => (
                                <Star key={idx} className="w-3 h-3 text-gray-600" />
                            ))}
                        </div>
                        <span className="text-gray-800 font-semibold text-xs">{product.average_rating}</span>
                    </div>

                    {/* Price */}
                    <div className="text-xl font-extrabold text-gray-900">
                        NPR. {product.current_price}
                    </div>
                </div>

                {/* View Details Button */}
                <Link to={`/product/${product.slug}`} >
                    <button className={`${isHovered ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-accent text-foreground hover:bg-[#94793b]"} transition-colors duration-300 py-2 cursor-pointer rounded-full font-semibold text-md shadow-lg w-full`}>
                        View Details
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default RecommendedCard