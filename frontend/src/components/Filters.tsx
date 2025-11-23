import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";

const sizes = [ 'S', 'M', 'L', 'XL', 'XXL', 'XXXL' ];

const Filters = ({ handleFilterUpdate }: { handleFilterUpdate: () => Promise<void> }) => {
    const [ searchParams, setSearchParams ] = useSearchParams();

    const [ filters, setFilters ] = useState(() => ({
        sort: searchParams.get("sort") ?? "",
        sizes: searchParams.getAll ? searchParams.getAll("size") : (searchParams.get("size") ? [ searchParams.get("size") ] : []),
        min: searchParams.get("min") ?? "",
        max: searchParams.get("max") ?? ""
    }));

    const toggleSize = (size: string) => {
        setFilters(prev => {
            const has = prev.sizes.includes(size);
            const nextSizes = has ? prev.sizes.filter(s => s !== size) : [ ...prev.sizes, size ];
            return { ...prev, sizes: nextSizes };
        })
    }

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.sort && filters.sort !== "none") params.set("sort", filters.sort);
        filters.sizes.forEach(s => s && params.append("size", s));
        if (filters.min) params.set("min", String(filters.min));
        if (filters.max) params.set("max", String(filters.max));
        setSearchParams(params);
    }


    //This pattern avoids handleFilterUpdate to run during first initial render done by useEffect.
    const prev = useRef<string | null>(null);

    useEffect(() => {
        const current = searchParams.toString();

        // Skip if first render AND params didn’t truly change
        if (prev.current === null) {
            prev.current = current;
            return;
        }

        // Only run when the actual params string changes
        if (prev.current !== current) {
            handleFilterUpdate();
        }

        prev.current = current;
    }, [ searchParams ]);



    return (
        <section className="xl:sticky top-[112px] max-h-[calc(100vh-124px)] col-span-full xl:col-span-1 xl:row-span-full py-5 px-4 border-b-2 xl:border-b-0 xl:border-r-2 border-accent my-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:flex-col gap-y-4 gap-x-5 xl:gap-10">
                <div className="flex gap-1 items-center">
                    <p className="font-semibold text-base xl:text-lg">Sort By:</p>
                    <Select onValueChange={value => setFilters(prev => ({ ...prev, sort: value }))} defaultValue="none">
                        <SelectTrigger className="w-[180px] border-foreground/80 rounded-sm focus-visible:ring-accent focus-visible:ring-2">
                            <SelectValue placeholder="Select a fruit" />
                        </SelectTrigger>
                        <SelectContent className="text-lg">
                            <SelectGroup>
                                <SelectLabel>Fruits</SelectLabel>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="price_desc">Price High to Low</SelectItem>
                                <SelectItem value="price_asc">Price Low to High</SelectItem>
                                <SelectItem value="time_desc">Newest First</SelectItem>
                                <SelectItem value="time_asc">Oldest First</SelectItem>
                                <SelectItem value="popular">Popular</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center xl:items-baseline xl:flex-col gap-1">
                    <p className="font-semibold xl:text-lg">Size:</p>
                    <div className="px-4 flex flex-wrap gap-2 ">
                        {sizes.map((size, index) => (
                            <div onClick={() => toggleSize(size)} key={index} className={`cursor-pointer border border-foreground rounded-sm flex items-center justify-center w-12 xl:w-16 h-5 xl:h-7 ${filters.sizes.includes(size) ? "bg-foreground text-secondary" : "bg-transparent text-foreground"}`}>
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
                            <Input type="number" min={500} value={filters.min} onChange={e => setFilters(prev => ({ ...prev, min: e.target.value }))} placeholder="500" className="border-foreground w-20 focus-visible:ring-accent" />
                        </div>
                        <div className="flex gap-2 items-center">
                            <p>To: </p>
                            <Input type="number" max={15000} value={filters.max} onChange={e => setFilters(prev => ({ ...prev, max: e.target.value }))} placeholder="5000" className="border-foreground w-20 focus-visible:ring-accent" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <Button variant="default" size="default" className="w-full  cursor-pointer" onClick={applyFilters}>Apply Filters</Button>
            </div>
        </section>
    )
}

export default Filters