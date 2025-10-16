import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
    title: string
    value: string
    change: string
    icon: LucideIcon
    trend: "up" | "down"
}

export function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
    return (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold">{value}</p>
                        <p className={`text-xs font-medium ${trend === "up" ? "text-green-600" : "text-red-600"}`}>{change}</p>
                    </div>
                    <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-accent" />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
