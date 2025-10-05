"use client"

import { Button } from "@/components/ui/button"

interface QuantitySelectionModalProps {
  itemName: string
  onSelect: (quantity: number) => void
  onCancel: () => void
}

export function QuantitySelectionModal({ itemName, onSelect, onCancel }: QuantitySelectionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-scale-in">
      <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-12 max-w-lg w-full border-2 border-border shadow-2xl">
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-foreground mb-3">How many</h2>
            <p className="text-3xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {itemName}?
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((num) => (
              <Button
                key={num}
                onClick={() => onSelect(num)}
                size="lg"
                variant="outline"
                className="h-28 text-5xl font-bold hover:bg-primary hover:text-white hover:border-primary border-2 rounded-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
              >
                {num}
              </Button>
            ))}
          </div>

          <div className="text-center pt-4">
            <Button onClick={onCancel} variant="ghost" size="lg" className="text-muted-foreground text-lg">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
