import { Search } from "lucide-react"
import { FaShoppingCart, FaBars } from "react-icons/fa";
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { useEffect, useState } from "react";
import { SignedIn, SignedOut, SignUpButton, useAuth, UserButton } from "@clerk/clerk-react";

const NavBar = () => {
    const [ isScrolled, setIsScrolled ] = useState(false);

    const { isLoaded } = useAuth()

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        }

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [])

    return (
        <header className={`text-secondary transition-colors duration-500 h-16 md:h-24 flex items-center justify-between px-4 lg:px-8 xl:px-8 2xl:px-48 font-[Inter] sticky top-0 z-10
        ${isScrolled ? "bg-foreground/90 backdrop-blur-md" : "bg-foreground"}`}>
            <div className="flex gap-1 md:gap-2 items-center">
                <img src="/logo.svg" alt="Logo" className="w-10 md:w-12 aspect-auto" />
                <p className="text-lg md:text-2xl font-bold">CLOTHLY</p>
                {/* <div className="bg-red-500 h-10 aspect-square">h</div> */}
            </div>
            <nav className="hidden md:flex items-center gap-8 text-lg font-light">
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

            <div className="flex items-center gap-1 md:gap-4">
                <div className="relative hidden lg:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        type="search"
                        placeholder="Search..."
                        className="pl-10 w-48 bg-white/10 border-white/20  text-white placeholder:text-white/60 rounded-full"
                    />
                </div>


                {!isLoaded && <Button disabled={true} variant="secondary" size="sm" className="h-6 md:hidden text-sm bg-secondary text-foreground font-semibold hover:bg-secondary transition-all cursor-pointer hover:shadow-[0px_0px_24px_0px_#f5d282]">
                    Sign Up
                </Button>}
                <SignedOut>
                    <SignUpButton mode="modal" oauthFlow="popup">
                        <Button disabled={!isLoaded} variant="secondary" size="sm" className="h-6 md:hidden text-sm bg-secondary text-foreground font-semibold hover:bg-secondary transition-all cursor-pointer hover:shadow-[0px_0px_24px_0px_#f5d282]">
                            Sign Up
                        </Button>
                    </SignUpButton>
                </SignedOut>

                <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-accent cursor-pointer">
                    <FaShoppingCart className="size-4 md:size-6" />
                </Button>

                <Button variant="ghost" size="icon" className="text-white hover:bg-transparent hover:text-accent cursor-pointer md:hidden">
                    <FaBars className="size-5 " />
                </Button>

                {!isLoaded && <Button disabled={true} variant="secondary" size="sm" className="hidden md:block bg-secondary text-foreground font-semibold hover:bg-secondary transition-all cursor-pointer hover:shadow-[0px_0px_24px_0px_#f5d282]">
                    Sign Up
                </Button>}
                <SignedOut>
                    <SignUpButton mode="modal" oauthFlow="popup">
                        <Button disabled={!isLoaded} variant="secondary" size="sm" className="hidden md:block bg-secondary text-foreground font-semibold hover:bg-secondary transition-all cursor-pointer hover:shadow-[0px_0px_24px_0px_#f5d282]">
                            Sign Up
                        </Button>
                    </SignUpButton>
                </SignedOut>

                <SignedIn>
                    <UserButton />
                </SignedIn>

            </div>
        </header>
    )
}

export default NavBar