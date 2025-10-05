"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface OrderCompleteModalProps {
  orderNumber: string
  total: number
  onNewOrder: () => void
}

export function OrderCompleteModal({ orderNumber, total, onNewOrder }: OrderCompleteModalProps) {
  const router = useRouter()

  const handleNewOrder = () => {
    onNewOrder()
  }

  const handleGoHome = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-scale-in">
      <div className="bg-card/95 backdrop-blur-sm rounded-3xl p-12 max-w-lg w-full shadow-2xl border-2 border-border">
        <div className="text-center mb-8">
          <div className="w-28 h-28 mx-auto bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center mb-6 shadow-2xl animate-pulse-glow">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-foreground mb-3">Order Confirmed!</h2>
          <p className="text-xl text-muted-foreground">Your order has been placed successfully</p>
        </div>

        <div className="bg-muted/30 rounded-2xl p-8 mb-8 space-y-6 border-2 border-border">
          <div className="text-center">
            <p className="text-base text-muted-foreground mb-2">Order Number</p>
            <p className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {orderNumber}
            </p>
          </div>
          <div className="border-t-2 border-border pt-6 text-center">
            <p className="text-base text-muted-foreground mb-2">Total</p>
            <p className="text-3xl font-bold text-foreground">${total.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl p-6 mb-8 border-2 border-primary/30">
          <p className="text-center text-xl font-medium text-foreground">Please proceed to the pickup window</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleNewOrder}
            size="lg"
            className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            New Order
          </Button>
          <Button
            onClick={handleGoHome}
            size="lg"
            variant="outline"
            className="w-full h-16 text-xl font-semibold bg-transparent border-2 rounded-2xl hover:bg-muted/30 transition-all duration-300"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
