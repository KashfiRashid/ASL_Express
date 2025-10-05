import type { OrderItem } from "@/lib/types"
import { ItemCard } from "./item-card"

interface OrderDisplayProps {
  items: OrderItem[]
}

export function OrderDisplay({ items }: OrderDisplayProps) {
  if (items.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-12 min-h-[500px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🍔</div>
          <h2 className="text-2xl font-semibold text-foreground">Start Your Order</h2>
          <p className="text-muted-foreground">Make a gesture to add items to your order</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-semibold text-foreground mb-6">Your Order</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <ItemCard key={`${item.id}-${index}`} item={item} />
        ))}
      </div>
    </div>
  )
}
