import { Button } from "./ui/button"

const BrandInfo = () => {
    return (
        <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-64 my-2 sm:my-10 md:my-16 font-[Inter] ">
            <div className="py-6 md:px-6 w-full">
                <h2 className="w-full text-center mx-auto text-3xl lg:text-4xl font-extrabold mt-1 md:mt-6">Your Story, Woven in Every Thread</h2>
                <p className="w-full lg:w-4xl text-center mx-auto text-lg md:text-xl lg:text-2xl  mt-5 text-foreground/90">We don't mass-produce. We craft. Every T-shirt is designed to reflect who you are: Bold, confident, and unapologetically unique.</p>
                <div className="flex gap-8 md:gap-12 mt-10 px-5 sm:px-0 md:px-10">
                    <img className="hidden sm:block object-cover aspect-[6/7] min-w-48 md:max-w-3xs lg:max-w-xs" src="/1.webp" alt="about image" />
                    <div className="text-lg md:text-xl lg:text-2xl text-foreground/80 flex flex-col min-h-full justify-end gap-8 md:pr-5 text-justify" >
                        <p>Born from a love for fashion and self-expression, our brand was built to challenge ordinary. We carefully select premium fabrics, design with precision, and let you add your personal touch. The result? A custom-made T-shirt that feels as good as it looks.</p>
                        <p>When you wear one of our tees, you’re not just dressing up. You’re telling your story — one that can’t be copied, only created.</p>
                        <div>
                            <Button className='bg-accent text-foreground hover:bg-accent cursor-pointer hover:shadow-[0px_0px_24px_-1px_#C9A34B] font-semibold h-12 md:h-14 lg:h-16 w-full sm:w-44 md:w-48 lg:w-52 text-lg lg:text-xl'>
                                Browse Collection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default BrandInfo