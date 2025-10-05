import type { OrderItem } from "@/lib/types"
import Image from "next/image"

interface ItemCardProps {
  item: OrderItem
}

export function ItemCard({ item }: ItemCardProps) {
  return (
    <div className="bg-card rounded-lg p-4 border border-border hover:shadow-md transition-shadow">
      <div className="relative aspect-square mb-3 rounded-md overflow-hidden bg-muted">
        <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{item.emoji}</span>
          <span className="text-sm font-semibold text-foreground bg-muted rounded-full w-7 h-7 flex items-center justify-center">
            {item.quantity}
          </span>
        </div>
        <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
        <p className="text-lg font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  )
}
