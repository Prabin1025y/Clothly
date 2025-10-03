import { FaFacebookSquare } from "react-icons/fa";
import { FaSquareXTwitter } from 'react-icons/fa6';
import { AiFillTikTok, AiFillInstagram } from "react-icons/ai";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Footer = () => {
    return (
        <footer className='flex flex-col items-center justify-center min-w-full bg-foreground text-secondary pt-12 md:pt-20 pb-5 gap-4 md:gap-6 font-[Inter] px-4'>
            <div className="flex gap-1 md:gap-2 items-center">
                <img src="/logo.svg" alt="Logo" className="w-12 md:w-16 aspect-auto" />
                <p className="text-lg md:text-3xl font-bold">CLOTHLY</p>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-xl">
                <a href="#" className="text-white hover:text-accent transition-colors">
                    Home
                </a>
                <a href="#" className="text-white hover:text-accent transition-colors">
                    Shop
                </a>
                <a href="#" className="text-white hover:text-accent transition-colors">
                    About
                </a>
                <a href="#" className="text-white hover:text-accent transition-colors">
                    Contact
                </a>
            </nav>
            <div className="text-accent flex gap-6 md:gap-10 items-center">
                <FaFacebookSquare size={28} className="md:w-[30px] md:h-[30px] cursor-pointer hover:scale-105" />
                <AiFillInstagram size={30} className="md:w-[32px] md:h-[32px] cursor-pointer hover:scale-105" />
                <AiFillTikTok size={28} className="md:w-[30px] md:h-[30px] cursor-pointer hover:scale-105" />
                <FaSquareXTwitter size={28} className="md:w-[30px] md:h-[30px] cursor-pointer hover:scale-105" />
            </div>
            <div className="grid gap-2 w-full max-w-md">
                <p className="w-full mx-auto text-center text-lg md:text-xl font-light">Newsletter</p>
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                    <Input placeholder="Email Address" className="px-4 py-2 rounded-sm h-10 w-full text-base md:text-lg focus-visible:ring-accent focus-visible:ring-1 text-secondary" />
                    <Button className='bg-accent rounded-sm text-foreground hover:bg-accent cursor-pointer hover:shadow-[0px_0px_12px_-1px_#C9A34B] font-medium h-10 w-full sm:w-32 text-base'>
                        SUBSCRIBE
                    </Button>
                </div>
            </div>
            <p className="font-light text-xs text-secondary/40 text-center px-2">Copyright ©2025. All rights reserved | Made with love by <span className="text-accent">Prabin Acharya</span></p>
        </footer>
    )
}

export default Footer