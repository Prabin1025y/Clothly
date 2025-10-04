import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"

const Filters = () => {
    return (
        <section className="hidden lg:flex sticky top-[112px] max-h-[calc(100vh-124px)] col-span-1 row-span-full py-5 px-4 border-r-2 border-accent my-4 flex-col gap-10">
            <div className="flex gap-1 items-center">
                <p className="font-semibold text-lg">Sort By:</p>
                <Select>
                    <SelectTrigger className="w-[180px] border-foreground/80 rounded-sm focus-visible:ring-accent focus-visible:ring-2">
                        <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent className="text-lg">
                        <SelectGroup>
                            <SelectLabel>Fruits</SelectLabel>
                            <SelectItem value="apple">Price Low to High</SelectItem>
                            <SelectItem value="banana">Banana</SelectItem>
                            <SelectItem value="blueberry">Blueberry</SelectItem>
                            <SelectItem value="grapes">Grapes</SelectItem>
                            <SelectItem value="pineapple">Pineapple</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">Color:</p>
                <div className="px-4 flex flex-wrap gap-2">
                    <div className="relative w-12 aspect-square bg-green-800 border-3 rounded-md border-accent overflow-hidden">
                        <div className="h-8 aspect-square bg-accent absolute -bottom-5 -right-5 rotate-45" />
                    </div>
                    <div className="relative w-12 aspect-square bg-red-800 border-2 border-foreground rounded-md overflow-hidden ">
                        <div />
                    </div>
                    <div className="relative w-12 aspect-square bg-orange-800 border-2 border-foreground rounded-md overflow-hidden ">
                        <div />
                    </div>
                    <div className="relative w-12 aspect-square bg-blue-800 border-2 border-foreground rounded-md overflow-hidden ">
                        <div />
                    </div>
                    <div className="relative w-12 aspect-square bg-lime-800 border-2 border-foreground rounded-md overflow-hidden ">
                        <div />
                    </div>
                    <div className="relative w-12 aspect-square bg-violet-800 border-2 border-foreground rounded-md overflow-hidden ">
                        <div />
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">Size:</p>
                <div className="px-4 flex flex-wrap gap-2 ">
                    <div className="border border-foreground bg-transparent rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                    <div className="border border-foreground bg-foreground text-secondary rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                    <div className="border border-foreground bg-transparent rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                    <div className="border border-foreground bg-transparent rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                    <div className="border border-foreground bg-transparent rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                    <div className="border border-foreground bg-transparent rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                    <div className="border border-foreground bg-transparent rounded-sm flex items-center justify-center w-16 h-7">
                        S
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">Price Range:</p>
                <div className="flex flex-wrap gap-2 items-center px-4 font-semibold">
                    <div className="flex gap-2 items-center">
                        <p>From: </p>
                        <Input type="number" min={500} placeholder="500" className="border-foreground w-20 focus-visible:ring-accent" />
                    </div>
                    <div className="flex gap-2 items-center">
                        <p>To: </p>
                        <Input type="number" max={15000} placeholder="5000" className="border-foreground w-20 focus-visible:ring-accent" />
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Filters