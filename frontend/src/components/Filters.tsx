import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "react-router";

const sizes = [ 'S', 'M', 'L', 'XL', 'XXL', 'XXXL' ];

const Filters = () => {
    const [ searchParams, setSearchParams ] = useSearchParams();

    return (
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-col xl:sticky top-[112px] max-h-[calc(100vh-124px)] col-span-full xl:col-span-1 xl:row-span-full py-5 px-4 border-b-2 xl:border-b-0 xl:border-r-2 border-accent my-4 gap-y-4 gap-x-5 xl:gap-10">
            <div className="flex gap-1 items-center">
                <p className="font-semibold text-base xl:text-lg">Sort By:</p>
                <Select onValueChange={value => setSearchParams(searchParams => { searchParams.set("sort", value); return searchParams; })}>
                    <SelectTrigger className="w-[180px] border-foreground/80 rounded-sm focus-visible:ring-accent focus-visible:ring-2">
                        <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent className="text-lg">
                        <SelectGroup>
                            <SelectLabel>Fruits</SelectLabel>
                            <SelectItem value="price_desc">Price High to Low</SelectItem>
                            <SelectItem value="price_asc">Price Low to High</SelectItem>
                            <SelectItem value="time_desc">Newest First</SelectItem>
                            <SelectItem value="time_asc">Oldest First</SelectItem>
                            <SelectItem value="popular">Popular</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            {/* <div className="flex items-center xl:items-baseline xl:flex-col gap-1">
                <p className="font-semibold xl:text-lg">Color:</p>
                <div className="px-4 flex flex-wrap gap-2">
                    <div className="relative w-8 h-8 xl:w-12 aspect-square bg-green-800 border-3 rounded-md border-accent overflow-hidden">
                        <div className="h-8 aspect-square bg-accent absolute -bottom-5 -right-5 rotate-45" />
                    </div>
                    <div className="relative w-8 h-8 xl:w-12 aspect-square bg-green-800 border-2 rounded-md border-foreground overflow-hidden" />
                    <div className="relative w-8 h-8 xl:w-12 aspect-square bg-green-800 border-2 rounded-md border-foreground overflow-hidden" />

                    <div className="relative w-8 h-8 xl:w-12 aspect-square bg-green-800 border-2 rounded-md border-foreground overflow-hidden" />
                    <div className="relative w-8 h-8 xl:w-12 aspect-square bg-green-800 border-2 rounded-md border-foreground overflow-hidden" />
                    <div className="relative w-8 h-8 xl:w-12 aspect-square bg-green-800 border-2 rounded-md border-foreground overflow-hidden" />

                </div>
            </div> */}

            <div className="flex items-center xl:items-baseline xl:flex-col gap-1">
                <p className="font-semibold xl:text-lg">Size:</p>
                <div className="px-4 flex flex-wrap gap-2 ">
                    {sizes.map((size, index) => (
                        <div onClick={() => setSearchParams(searchParams => { searchParams.set("size", size); return searchParams; })} key={index} className={`cursor-pointer border border-foreground  rounded-sm flex items-center justify-center w-12 xl:w-16 h-5 xl:h-7 ${searchParams.get("size") === size ? "bg-foreground text-secondary" : "bg-transparent text-foreground"}`}>
                            {size}
                        </div>
                    ))}

                </div>
            </div>

            <div className="flex items-center xl:items-baseline xl:flex-col gap-1">
                <p className="font-semibold xl:text-lg">Price Range:</p>
                <div className="flex flex-wrap gap-2 items-center px-4 font-semibold text-sm">
                    <div className="flex gap-2 items-center">
                        <p>From: </p>
                        <Input type="number" min={500} onChange={e => searchParams.set("min", e.target.value)} placeholder="500" className="border-foreground w-20 focus-visible:ring-accent" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <p>To: </p>
                        <Input type="number" max={15000} onChange={e => searchParams.set("max", e.target.value)} placeholder="5000" className="border-foreground w-20 focus-visible:ring-accent" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Filters