"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MENU_ITEMS } from "@/lib/menu-data"
import type { MenuItem, OrderItem } from "@/lib/types"
import { ReceiptPanel } from "@/components/receipt-panel"
import { QuantitySelectionModal } from "@/components/quantity-selection-modal"
import { OrderCompleteModal } from "@/components/order-complete-modal"
import { ThumbsUp } from "lucide-react"
import { useGesturePolling } from "@/lib/hooks/use-gesture-polling"
import { processCommandString } from "@/lib/command-processor"
import { useFinalizedOrderPolling } from "@/lib/hooks/use-finalized-order-polling"
import { parseOrderString } from "@/lib/order-string-parser"

type FlowStage = "menu" | "quantity-select" | "adding-item" | "ordering" | "confirming" | "complete"

async function playAudio(text: string) {
  try {
    // Check if browser supports speech synthesis
    if (!("speechSynthesis" in window)) {
      console.warn("[v0] Speech synthesis not supported in this browser")
      return
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9 // Slightly slower for clarity
    utterance.pitch = 1.0
    utterance.volume = 1.0

    window.speechSynthesis.speak(utterance)
    console.log("[v0] Playing audio for text:", text)
  } catch (error) {
    console.error("[v0] Failed to play audio:", error)
  }
}

export default function OrderPage() {
  const router = useRouter()
  const [stage, setStage] = useState<FlowStage>("menu")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [clientId, setClientId] = useState<string>("")

  const handleCommand = useCallback(
    async (command: string) => {
      console.log("[v0] Processing command:", command, "Stage:", stage)

      // Process command using modular processor
      const result = processCommandString(command, stage)

      if (!result.shouldTransition) {
        console.log("[v0] Command ignored:", command)
        return
      }

      // Handle item selection
      if (result.type === "ITEM" && result.item) {
        setSelectedItem(result.item)
        setStage("quantity-select")
        console.log("[v0] Item selected:", result.item.name)
        return
      }

      // Handle quantity selection
      if (result.type === "QUANTITY" && result.quantity && selectedItem) {
        setSelectedQuantity(result.quantity)

        // Add item to order
        const newItem: OrderItem = {
          ...selectedItem,
          quantity: result.quantity,
          confirmed: true,
        }
        setOrderItems((prev) => [...prev, newItem])
        setStage("adding-item")
        console.log("[v0] Added to order:", newItem.name, "x", result.quantity)

        // Show animation then return to menu
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setSelectedItem(null)
        setStage("menu")
        return
      }

      // Handle finish command
      if (result.type === "FINISH" && orderItems.length > 0) {
        setStage("confirming")
        console.log("[v0] Finishing order...")

        // Wait 5 seconds then show complete
        await new Promise((resolve) => setTimeout(resolve, 5000))
        setStage("complete")
        return
      }
    },
    [stage, selectedItem, orderItems.length],
  )

  const handleFinalizedOrder = useCallback(async (orderData: string, clientId: string) => {
    console.log("[v0] Processing finalized order:", orderData)
    setClientId(clientId)

    // Parse the order string
    const parsedItems = parseOrderString(orderData)
    console.log("[v0] Parsed items:", parsedItems)

    if (parsedItems.length === 0) {
      console.error("[v0] No valid items found in order string")
      return
    }

    // Animate through each item
    for (const { item, quantity } of parsedItems) {
      // Show item selection
      setSelectedItem(item)
      setStage("quantity-select")
      console.log("[v0] Showing item:", item.name)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Show quantity
      setSelectedQuantity(quantity)
      console.log("[v0] Showing quantity:", quantity)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Add to order
      const newItem: OrderItem = {
        ...item,
        quantity,
        confirmed: true,
      }
      setOrderItems((prev) => [...prev, newItem])
      setStage("adding-item")
      console.log("[v0] Added to order:", item.name, "x", quantity)
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Reset for next item
      setSelectedItem(null)
      setStage("menu")
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    await playAudio(orderData)

    // All items added, show confirming screen
    setStage("confirming")
    await new Promise((resolve) => setTimeout(resolve, 5000))
    setStage("complete")
  }, [])

  const { currentCommand, isProcessing } = useGesturePolling({
    onCommandReceived: handleCommand,
    enabled: true,
  })

  const {
    currentOrder,
    isProcessing: isOrderProcessing,
    lastPollTime,
    hasProcessedOrder, // Get the flag
    resetPolling, // Get the reset function
  } = useFinalizedOrderPolling({
    onOrderReceived: handleFinalizedOrder,
    enabled: true,
    pollInterval: 5000, // 5 seconds
    stopAfterProcessing: true, // Stop after processing one order
  })

  // Manual item selection (for testing without backend)
  const handleItemClick = (item: MenuItem) => {
    if (isOrderProcessing) return // Don't allow manual selection during automated processing
    setSelectedItem(item)
    setStage("quantity-select")
  }

  // Manual quantity selection
  const handleQuantitySelect = (quantity: number) => {
    if (!selectedItem || isOrderProcessing) return

    const newItem: OrderItem = {
      ...selectedItem,
      quantity,
      confirmed: true,
    }
    setOrderItems((prev) => [...prev, newItem])
    setStage("adding-item")

    setTimeout(() => {
      setSelectedItem(null)
      setStage("menu")
    }, 1500)
  }

  // Manual finish order
  const handleFinishOrder = () => {
    if (isOrderProcessing) return
    setStage("confirming")
    setTimeout(() => {
      setStage("complete")
    }, 5000)
  }

  // Calculate totals
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  // Render different screens based on stage
  if (stage === "complete") {
    return (
      <OrderCompleteModal
        orderNumber={clientId || `#${Math.floor(Math.random() * 10000)}`}
        total={total}
        onNewOrder={() => {
          setOrderItems([])
          setClientId("")
          setStage("menu")
          resetPolling() // Reset polling when starting new order
          router.push("/")
        }}
      />
    )
  }

  if (stage === "confirming") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-8">
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="w-24 h-24 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-white">Confirming Your Order</h2>
            <p className="text-xl text-blue-200">Please wait while we process your order...</p>
            {clientId && <p className="text-lg text-blue-300">{clientId}</p>}
          </div>
          {/* Show order summary */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-white/90">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-white/20 pt-2 mt-2 flex justify-between font-bold text-white">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (stage === "adding-item") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-8">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="text-8xl">{selectedItem?.emoji}</div>
          <div className="space-y-2">
            <h2 className="text-4xl font-bold text-white">Added to Order!</h2>
            <p className="text-2xl text-blue-200">
              {selectedQuantity}x {selectedItem?.name}
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-green-400">
            <ThumbsUp className="w-8 h-8" />
            <span className="text-xl font-semibold">Confirmed</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-8">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {isOrderProcessing && (
          <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-semibold animate-pulse">
            Processing Order...
          </div>
        )}
        {hasProcessedOrder && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold">
            ✓ Order Complete - Polling Stopped
          </div>
        )}
        {!hasProcessedOrder && !isOrderProcessing && (
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm animate-pulse">Waiting for order...</div>
        )}
        {lastPollTime && !hasProcessedOrder && (
          <div className="bg-blue-500/80 text-white px-4 py-2 rounded-lg text-sm">
            Last Check: {lastPollTime.toLocaleTimeString()}
          </div>
        )}
        {currentOrder && (
          <div className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm max-w-xs truncate">
            Order: {currentOrder}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {stage === "quantity-select" ? "Select Quantity" : "Select Your Items"}
          </h1>
          <p className="text-xl text-blue-200">
            {stage === "quantity-select"
              ? `How many ${selectedItem?.name}?`
              : isOrderProcessing
                ? "Processing your order..."
                : "Show your ASL sign to order"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Menu or Quantity Selection */}
          <div className="lg:col-span-2">
            {stage === "menu" ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MENU_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    disabled={isOrderProcessing}
                    className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 hover:border-blue-400 hover:bg-white/20 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-center space-y-4">
                      <div className="text-6xl">{item.emoji}</div>
                      <h3 className="text-2xl font-bold text-white">{item.name}</h3>
                      <p className="text-lg text-blue-200">${item.price.toFixed(2)}</p>
                      <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-400/30">
                        <p className="text-sm font-semibold text-blue-300 mb-1">ASL Sign:</p>
                        <p className="text-xs text-blue-200">{item.aslSign}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : stage === "quantity-select" ? (
              <QuantitySelectionModal
                item={selectedItem!}
                onSelect={handleQuantitySelect}
                onCancel={() => {
                  if (!isOrderProcessing) {
                    setSelectedItem(null)
                    setStage("menu")
                  }
                }}
              />
            ) : null}
          </div>

          {/* Right: Receipt */}
          <div className="lg:col-span-1">
            {orderItems.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border-2 border-white/20 sticky top-8">
                <ReceiptPanel
                  items={orderItems}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  onFinalizeOrder={handleFinishOrder}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
