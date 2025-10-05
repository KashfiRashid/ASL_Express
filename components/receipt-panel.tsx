"use client"

import type { OrderItem } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ReceiptPanelProps {
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  onFinalizeOrder: () => void
}

export function ReceiptPanel({ items, subtotal, tax, total, onFinalizeOrder }: ReceiptPanelProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="bg-card rounded-lg border border-border p-6 sticky top-6">
      {/* Receipt Header */}
      <div className="border-b border-border pb-4 mb-4">
        <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {new Date().toLocaleDateString()} •{" "}
          {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>

      {/* Items List */}
      <div className="space-y-3 mb-6 max-h-[300px] overflow-auto">
        {items.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.emoji}</span>
                <p className="font-medium text-foreground">{item.name}</p>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${item.price.toFixed(2)} × {item.quantity}
              </p>
            </div>
            <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tax (8%)</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-semibold border-t border-border pt-3 mt-3">
          <span>Total</span>
          <span className="text-primary">${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-2">
        <Button
          onClick={onFinalizeOrder}
          size="lg"
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
        >
          Confirm Order
        </Button>
        <Button variant="outline" size="lg" className="w-full bg-transparent">
          Continue Ordering
        </Button>
      </div>
    </div>
  )
}
