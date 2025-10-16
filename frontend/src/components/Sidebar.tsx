"use client"

import { Home, Package, Users, Settings, BarChart3, ShoppingCart, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router"

const navigation = [
    { name: "Dashboard", href: "/admin", icon: Home },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/orders", icon: ShoppingCart },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
    // const pathname = usePathname()
    const { pathname } = useLocation()

    return (
        <aside className="sticky left-0 top-24 z-10 h-[90vh] w-64 border-r border-border bg-card/50 backdrop-blur-xl">
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center border-b border-border px-6">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                            <span className="text-accent-foreground font-bold text-lg">A</span>
                        </div>
                        <span className="font-semibold text-lg">Admin</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* User section */}
                <div className="border-t border-border p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                            <span className="text-accent-foreground font-semibold">JD</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">John Doe</p>
                            <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}
