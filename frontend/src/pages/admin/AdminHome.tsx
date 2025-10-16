import { Package, DollarSign, ShoppingCart, TrendingUp } from "lucide-react"
// import { Header } from "@/components/header"
import { StatCard } from "@/components/StatCard"

export default function AdminHome() {
    return (
        <div >
            {/* <Header /> */}

            <main className="p-6 space-y-6">
                {/* Page title */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
                </div>

                {/* Stats grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        title="Total Revenue"
                        value="$45,231"
                        change="+20.1% from last month"
                        icon={DollarSign}
                        trend="up"
                    />
                    <StatCard title="Total Products" value="2,345" change="+12.5% from last month" icon={Package} trend="up" />
                    <StatCard
                        title="Total Orders"
                        value="1,234"
                        change="+8.2% from last month"
                        icon={ShoppingCart}
                        trend="up"
                    />
                    <StatCard
                        title="Conversion Rate"
                        value="3.24%"
                        change="-2.1% from last month"
                        icon={TrendingUp}
                        trend="down"
                    />
                </div>

            </main>
        </div>
    )
}
