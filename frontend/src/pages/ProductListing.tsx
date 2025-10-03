import Filters from "@/components/Filters"


const ProductListing = () => {
    return (
        <main className=" gap-2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-48 font-[Inter] ">
            <div className="md:px-8 xl:px-16 2xl:px-24  grid grid-cols-4">
                <Filters />
                <section className="bg-blue-500/30 col-span-3 row-span-full">Products</section>
            </div>
        </main>
    )
}

export default ProductListing