"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ItemQuantityModalProps {
  itemName: string
  onConfirm: (quantity: number) => void
  onCancel: () => void
}

export function ItemQuantityModal({ itemName, onConfirm, onCancel }: ItemQuantityModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [stage, setStage] = useState<"quantity" | "confirm">("quantity")
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Auto-confirm on timeout
          if (stage === "quantity") {
            setStage("confirm")
            return 10
          } else {
            onConfirm(quantity)
            return 0
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [stage, quantity, onConfirm])

  const handleQuantitySelect = (qty: number) => {
    setQuantity(qty)
    setStage("confirm")
    setCountdown(10)
  }

  const handleConfirm = () => {
    console.log("[v0] User confirmed:", quantity, "x", itemName)
    onConfirm(quantity)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl p-8 max-w-md w-full border border-border shadow-xl">
        {stage === "quantity" ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">You selected {itemName}</h2>
              <p className="text-muted-foreground">How many would you like?</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <Button
                  key={num}
                  onClick={() => handleQuantitySelect(num)}
                  size="lg"
                  variant="outline"
                  className="h-16 text-xl font-semibold hover:bg-primary hover:text-primary-foreground hover:border-primary"
                >
                  {num}
                </Button>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Auto-selecting 1 in {countdown}s</p>
              <Button onClick={onCancel} variant="ghost" className="mt-2">
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Confirm Order</h2>
              <p className="text-lg text-muted-foreground">
                Add{" "}
                <span className="font-semibold text-foreground">
                  {quantity}x {itemName}
                </span>{" "}
                to your order?
              </p>
            </div>

            <div className="flex gap-3">
              <Button onClick={onCancel} variant="outline" size="lg" className="flex-1 bg-transparent">
                No
              </Button>
              <Button
                onClick={handleConfirm}
                size="lg"
                className="flex-1 bg-success hover:bg-success/90 text-success-foreground"
              >
                Yes, Add It
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">Auto-confirming in {countdown}s</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
