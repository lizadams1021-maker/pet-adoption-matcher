import { PawPrint, Heart, FileText, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"

const stats = [
  {
    icon: PawPrint,
    value: "5",
    label: "Active Pets",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    icon: Heart,
    value: "8",
    label: "New Matches",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
  },
  {
    icon: FileText,
    value: "12",
    label: "Pending Apps",
    bgColor: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  {
    icon: TrendingUp,
    value: "23",
    label: "This Week",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
