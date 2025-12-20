import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import { Link } from "react-router"

export default function OrderFailedPage() {
    return (
        <main className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md text-center space-y-8">
                {/* Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-destructive/10 blur-2xl rounded-full" />
                        <XCircle className="relative w-20 h-20 text-destructive" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-light tracking-tight text-foreground">Payment Failed</h1>
                    <p className="text-lg text-muted-foreground font-light leading-relaxed max-w-sm mx-auto">
                        {"Your payment could not be processed. Please try again."}
                    </p>
                </div>

                {/* Action */}
                <div className="pt-4">
                    <Button asChild size="lg" className="min-w-[200px] h-12 text-base font-normal">
                        <Link to="/checkout">Return to Checkout</Link>
                    </Button>
                </div>

                {/* Support link */}
                {/* <p className="text-sm text-muted-foreground">
                    {"Need help? "}
                    <Link
                        href="/support"
                        className="text-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
                    >
                        Contact Support
                    </Link>
                </p> */}
            </div>
        </main>
    )
}
