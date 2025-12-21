import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MoreVertical, ArrowUpDown, AlertOctagon, Loader2, Package } from "lucide-react"
import { orderKeys, useOrderItems } from "@/hooks/useOrders"
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";

export default function OrdersPage() {
    // const [ orders, setOrders ] = useState<Order[]>(mockOrders)
    const [ sortBy, setSortBy ] = useState<"date" | "price" | "name">("date")
    const [ filterDelivered, setFilterDelivered ] = useState<"all" | "delivered" | "not-delivered">("not-delivered")
    const [ sortOrder, setSortOrder ] = useState<"asc" | "desc">("desc")

    const { data, isLoading, isError, isFetching } = useOrderItems();
    const queryClient = useQueryClient();

    const orders = data ?? []

    const handleCancelOrder = (orderId: string) => {
        // setOrders(orders.filter((order) => order.id !== orderId))
    }

    // Sort and filter orders
    const filteredAndSortedOrders = useMemo(() => {
        let result = [ ...orders ]

        // Filter
        if (filterDelivered === "delivered") {
            result = result.filter((order) => order.status === "delivered")
        } else if (filterDelivered === "not-delivered") {
            result = result.filter((order) => order.status === "paid")
        }

        // Sort
        result.sort((a, b) => {
            let comparison = 0

            if (sortBy === "date") {
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            } else if (sortBy === "price") {
                comparison = (Number(a.unit_price) * a.quantity) - (Number(b.unit_price) * b.quantity)
            } else if (sortBy === "name") {
                comparison = a.product_name.localeCompare(b.product_name)
            }

            return sortOrder === "asc" ? comparison : -comparison
        })

        return result
    }, [ orders, sortBy, filterDelivered, sortOrder ])

    const toggleSortOrder = () => {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    }

    console.log(data)

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-light tracking-tight text-foreground">Orders</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Manage and track your </p>
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
                        {/* {filteredAndSortedOrders.length} {filteredAndSortedOrders.length === 1 ? "order" : "orders"} */}
                        orders
                    </div>
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {
                        (() => {
                            if (isError)
                                return <Empty className="relative w-full max-w-2xl bg-card rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300" >
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <AlertOctagon color="red" />
                                        </EmptyMedia>
                                        <EmptyTitle className="text-red-500">An Error Occured!!</EmptyTitle>
                                        <EmptyDescription className="text-red-400">
                                            An error occured while getting info about this item. Please try again!!
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <div className="flex gap-2">
                                            {(isFetching && !isLoading) ? <Button disabled className="bg-red-500">
                                                <Loader2 className="animate-spin" /> Retrying...
                                            </Button> : <Button
                                                className="cursor-pointer bg-red-500"
                                                onClick={() => queryClient.invalidateQueries({ queryKey: orderKeys.lists() })}
                                            >
                                                Retry
                                            </Button>}
                                        </div>
                                    </EmptyContent>
                                </Empty>

                            if (isLoading)
                                return <div>Loading...</div>

                            if (data?.length === 0 && !isFetching)
                                return <Empty >
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Package />
                                        </EmptyMedia>
                                        <EmptyTitle>No Product Yet</EmptyTitle>
                                        <EmptyDescription>
                                            You haven&apos;t ordered any products yet. Shop now to own some premium tees.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <div className="flex gap-2">
                                            <Link to={"/shop"}>
                                                <Button className="cursor-pointer">Shop Now</Button>
                                            </Link>
                                        </div>
                                    </EmptyContent>
                                </Empty>

                            return filteredAndSortedOrders.map((order) => (
                                <div
                                    key={order.variant_id}
                                    className="group rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Thumbnail */}
                                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                            <img
                                                src={order.url || "/placeholder.svg"}
                                                alt={order.alt_text}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Order Details */}
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-medium text-foreground">{order.product_name}</h3>
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
                                                            onClick={() => handleCancelOrder(order.variant_id)}
                                                        >
                                                            Cancel Order
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            <div className="flex items-center justify-between pt-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-medium text-foreground">${Number(order.unit_price).toFixed(2)}</span>
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${order.status === "delivered"
                                                            ? "bg-secondary text-secondary-foreground"
                                                            : "bg-muted text-muted-foreground"
                                                            }`}
                                                    >
                                                        {order.status === "delivered" ? "Delivered" : "In Transit"}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    {new Date(order.created_at).toLocaleDateString("en-US", {
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
                        }
                        )()
                    }
                </div>
            </div>
        </div>
    )
}
