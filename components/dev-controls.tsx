"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MENU_ITEMS } from "@/lib/menu-data"

interface DevControlsProps {
  onAddItem: (itemId: string) => void
}

export function DevControls({ onAddItem }: DevControlsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Button onClick={() => setIsOpen(!isOpen)} size="sm" variant="outline" className="shadow-lg bg-card">
        {isOpen ? "Hide" : "Dev Controls"}
      </Button>

      {isOpen && (
        <div className="absolute bottom-14 right-0 bg-card rounded-lg shadow-xl p-4 w-64 border border-border">
          <h3 className="text-xs font-semibold text-foreground mb-3">Simulate ASL Gestures</h3>

          <div className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <Button
                key={item.id}
                onClick={() => onAddItem(item.id)}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-left h-9"
              >
                <span className="text-base mr-2">{item.emoji}</span>
                <span className="flex-1 text-sm">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
