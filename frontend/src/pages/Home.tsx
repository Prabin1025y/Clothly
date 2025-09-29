import { Button } from '@/components/ui/button'
import { FaCrown } from "react-icons/fa";


const Home = () => {
    return (
        <>
            <section className='px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-48 font-[Inter]'>
                <div className='flex flex-col md:flex-row justify-between  w-full gap-6 lg:gap-12 pt-8  md:pt-0 lg:pt-16'>
                    {/* Content Section */}
                    <div className=' [&_*]:z-1 flex flex-col pt-8 sm:pt-16 md:pt-20 lg:pt-36 md:pl-8 xl:pl-16 2xl:pl-24 pb-10'>
                        {/* Hero Text */}
                        <div className='flex flex-col leading-[1.1] text-center md:text-left'>
                            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[4rem] font-extrabold tracking-wide'>
                                Custom Made
                            </h2>
                            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[4rem] font-extrabold tracking-wide'>
                                <span className='text-accent'>Premium</span> Quality
                            </h2>
                            <h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[4rem] font-extrabold tracking-wide'>
                                Made For You
                            </h2>
                        </div>

                        {/* Description */}
                        <p className='text-base sm:text-lg md:text-xl text-center md:text-left lg:self-start font-semibold text-[#4A4A4A] max-w-[416px] mx-auto lg:mx-0 my-4 md:my-5 px-4 md:px-0'>
                            Premium custom T-shirts tailored to your fit and style
                        </p>

                        {/* Buttons */}
                        <div className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start'>
                            <Button className='bg-accent text-foreground hover:bg-accent cursor-pointer hover:shadow-[0px_0px_24px_-1px_#C9A34B] font-semibold h-12 md:h-14 lg:h-16 w-full sm:w-44 md:w-48 lg:w-52 text-lg md:text-xl'>
                                Shop Now
                            </Button>
                            <Button className='border-foreground cursor-pointer hover:bg-white hover:shadow-[0px_0px_24px_-1px_#C9A34B] border bg-white text-foreground font-semibold h-12 md:h-14 lg:h-16 w-full sm:w-44 md:w-48 lg:w-52 text-lg md:text-xl'>
                                Design Yours
                            </Button>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className='fixed opacity-10 md:opacity-100 top-10 md:static w-full lg:max-w-[500px] xl:max-w-[600px] flex justify-center items-end lg:justify-end mt-8 lg:mt-0'>
                        <img
                            src="/Hero Image.png"
                            alt="hero image"
                            className='w-full max-w-[400px] sm:max-w-[500px] lg:max-w-full h-auto object-contain'
                        />
                    </div>
                </div>
            </section>

            {/* Content placeholder */}
            <div className='h-16 z-1 w-full flex justify-between items-center bg-[#E8D7B2] text-foreground px-4 lg:px-8 xl:px-48 2xl:px-96'>
                <div className='flex gap-1 font-semibold text-lg items-center'>
                    <FaCrown className='inline mr-2 text-lg md:text-2xl' />
                    <p>Premium Quality</p>
                </div>
                <div className='flex gap-1 font-semibold text-lg items-center'>
                    <FaCrown className='inline mr-2 text-lg md:text-2xl' />
                    <p>Premium Quality</p>
                </div>
                <div className='flex gap-1 font-semibold text-lg items-center'>
                    <FaCrown className='inline mr-2 text-lg md:text-2xl' />
                    <p>Premium Quality</p>
                </div>
            </div>
        </>
    )
}

export default Home