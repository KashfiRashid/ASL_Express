"use client"

import type { OrderItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useEffect, useState } from "react"

interface ConfirmationModalProps {
  item: OrderItem
  onConfirm: (confirmed: boolean) => void
}

export function ConfirmationModal({ item, onConfirm }: ConfirmationModalProps) {
  const [timeLeft, setTimeLeft] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          console.log("[v0] Confirmation timeout - auto-confirming item")
          onConfirm(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onConfirm])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-12 max-w-2xl w-full shadow-2xl border-8 border-primary animate-scale-in">
        {/* Timer */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent text-4xl font-black text-accent-foreground border-4 border-primary">
            {timeLeft}
          </div>
        </div>

        {/* Item Display */}
        <div className="text-center space-y-6 mb-8">
          <div className="relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-primary/20">
            <Image src={item.imageUrl || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
          </div>

          <div className="space-y-3">
            <h2 className="text-5xl font-black text-foreground text-balance">Did you want this?</h2>
            <div className="flex items-center justify-center gap-4">
              <span className="text-6xl">{item.emoji}</span>
              <div className="text-left">
                <p className="text-3xl font-black text-primary">{item.name}</p>
                <p className="text-2xl text-muted-foreground">Quantity: {item.quantity}</p>
              </div>
            </div>
            <p className="text-4xl font-black text-primary">${(item.price * item.quantity).toFixed(2)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-6">
          <Button
            onClick={() => onConfirm(false)}
            size="lg"
            variant="outline"
            className="h-24 text-3xl font-black border-4 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive rounded-2xl"
          >
            NO ✗
          </Button>
          <Button
            onClick={() => onConfirm(true)}
            size="lg"
            className="h-24 text-3xl font-black bg-success hover:bg-success/90 text-success-foreground rounded-2xl"
          >
            YES ✓
          </Button>
        </div>
      </div>
    </div>
  )
}
