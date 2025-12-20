import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, ArrowUpDown } from "lucide-react"

type Order = {
    id: string
    name: string
    totalPrice: number
    quantity: number
    size: string
    color: string
    thumbnail: string
    date: Date
    delivered: boolean
}

// Mock data for orders
const mockOrders: Order[] = [
    {
        id: "1",
        name: "Premium Cotton T-Shirt",
        totalPrice: 89.99,
        quantity: 2,
        size: "M",
        color: "Navy",
        thumbnail: "/navy-tshirt.jpg",
        date: new Date("2024-01-15"),
        delivered: false,
    },
    {
        id: "2",
        name: "Leather Messenger Bag",
        totalPrice: 249.0,
        quantity: 1,
        size: "L",
        color: "Brown",
        thumbnail: "/brown-leather-messenger-bag.png",
        date: new Date("2024-01-14"),
        delivered: true,
    },
    {
        id: "3",
        name: "Wool Blend Sweater",
        totalPrice: 129.5,
        quantity: 1,
        size: "L",
        color: "Charcoal",
        thumbnail: "/cozy-wool-sweater.png",
        date: new Date("2024-01-12"),
        delivered: false,
    },
    {
        id: "4",
        name: "Slim Fit Denim Jeans",
        totalPrice: 149.99,
        quantity: 1,
        size: "32",
        color: "Indigo",
        thumbnail: "/denim-jeans.png",
        date: new Date("2024-01-10"),
        delivered: true,
    },
    {
        id: "5",
        name: "Canvas Sneakers",
        totalPrice: 79.99,
        quantity: 1,
        size: "10",
        color: "White",
        thumbnail: "/white-sneakers.png",
        date: new Date("2024-01-08"),
        delivered: false,
    },
]

export default function OrdersPage() {
    const [ orders, setOrders ] = useState<Order[]>(mockOrders)
    const [ sortBy, setSortBy ] = useState<"date" | "price" | "name">("date")
    const [ filterDelivered, setFilterDelivered ] = useState<"all" | "delivered" | "not-delivered">("not-delivered")
    const [ sortOrder, setSortOrder ] = useState<"asc" | "desc">("desc")

    const handleCancelOrder = (orderId: string) => {
        setOrders(orders.filter((order) => order.id !== orderId))
    }

    // Sort and filter orders
    const filteredAndSortedOrders = useMemo(() => {
        let result = [ ...orders ]

        // Filter
        if (filterDelivered === "delivered") {
            result = result.filter((order) => order.delivered)
        } else if (filterDelivered === "not-delivered") {
            result = result.filter((order) => !order.delivered)
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0

            if (sortBy === "date") {
                comparison = a.date.getTime() - b.date.getTime()
            } else if (sortBy === "price") {
                comparison = a.totalPrice - b.totalPrice
            } else if (sortBy === "name") {
                comparison = a.name.localeCompare(b.name)
            }

            return sortOrder === "asc" ? comparison : -comparison
        })

        return result
    }, [ orders, sortBy, filterDelivered, sortOrder ])

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-light tracking-tight text-foreground">Orders</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Manage and track your order history</p>
                </div>

                {/* Filters and Sorting */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Filter:</span>
                            <Select value={filterDelivered} onValueChange={(value: any) => setFilterDelivered(value)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Orders</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="not-delivered">Not Delivered</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sort by:</span>
                            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Date</SelectItem>
                                    <SelectItem value="price">Price</SelectItem>
                                    <SelectItem value="name">Name</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={toggleSortOrder} className="h-9 w-9">
                                <ArrowUpDown className={`h-4 w-4 ${sortOrder === "desc" ? "rotate-180" : ""}`} />
                            </Button>
                        </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                        {filteredAndSortedOrders.length} {filteredAndSortedOrders.length === 1 ? "order" : "orders"}
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filteredAndSortedOrders.length === 0 ? (
                        <div className="rounded-lg border border-border bg-card p-12 text-center">
                            <p className="text-muted-foreground">No orders found</p>
                        </div>
                    ) : (
                        filteredAndSortedOrders.map((order) => (
                            <div
                                key={order.id}
                                className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Thumbnail */}
                                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                        <img
                                            src={order.thumbnail || "/placeholder.svg"}
                                            alt={order.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    {/* Order Details */}
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-medium text-foreground">{order.name}</h3>
                                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span>Qty: {order.quantity}</span>
                                                    <span>Size: {order.size}</span>
                                                    <span>Color: {order.color}</span>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                        <span className="sr-only">Open menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleCancelOrder(order.id)}
                                                    >
                                                        Cancel Order
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex items-center justify-between pt-1">
                                            <div className="flex items-center gap-3">
                                                <span className="text-lg font-medium text-foreground">${order.totalPrice.toFixed(2)}</span>
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${order.delivered
                                                        ? "bg-secondary text-secondary-foreground"
                                                        : "bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {order.delivered ? "Delivered" : "In Transit"}
                                                </span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {order.date.toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
