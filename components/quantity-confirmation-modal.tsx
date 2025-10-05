"use client"

import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface QuantityConfirmationModalProps {
  itemName: string
  quantity: number
  onConfirm: () => void
  onCancel: () => void
}

export function QuantityConfirmationModal({ itemName, quantity, onConfirm, onCancel }: QuantityConfirmationModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-12 max-w-lg w-full border-2 border-border shadow-2xl">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-bold text-foreground">Confirm Order</h2>

          <div className="bg-muted/50 rounded-2xl p-8 border-2 border-border">
            <p className="text-xl text-muted-foreground mb-3">Add to order:</p>
            <p className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {quantity}x {itemName}
            </p>
          </div>

          <div className="flex gap-6 pt-6">
            <Button
              onClick={onCancel}
              size="lg"
              variant="outline"
              className="flex-1 h-24 text-2xl border-2 hover:bg-destructive hover:text-white hover:border-destructive bg-transparent rounded-2xl transition-all duration-300 hover:scale-105"
            >
              <ThumbsDown className="w-10 h-10 mr-3" />
              No
            </Button>
            <Button
              onClick={onConfirm}
              size="lg"
              className="flex-1 h-24 text-2xl bg-gradient-to-r from-success to-accent hover:from-success/90 hover:to-accent/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <ThumbsUp className="w-10 h-10 mr-3" />
              Yes, Add It
            </Button>
          </div>

          <p className="text-base text-muted-foreground pt-4">👍 Thumbs Up = Confirm | 👎 Thumbs Down = Cancel</p>
        </div>
      </div>
    </div>
  )
}
