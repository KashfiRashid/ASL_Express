"use client"

import { useState, useEffect, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

interface StringsRow {
  id: string
  content: string
  created_at: string
  updated_at: string
}

interface UseOrderPollingOptions {
  onOrderReceived: (orderData: string) => Promise<void>
  enabled?: boolean
  pollInterval?: number
  stopAfterProcessing?: boolean
}

export function useFinalizedOrderPolling({
  onOrderReceived,
  enabled = true,
  pollInterval = 5000,
  stopAfterProcessing = true,
}: UseOrderPollingOptions) {
  const [currentOrder, setCurrentOrder] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null)
  const [hasProcessedOrder, setHasProcessedOrder] = useState(false)
  const [lastProcessedId, setLastProcessedId] = useState<string | null>(null)

  const pollForOrders = useCallback(async () => {
    if (!enabled || isProcessing || (stopAfterProcessing && hasProcessedOrder)) {
      return
    }

    try {
      const supabase = createBrowserClient()

      const { data, error } = await supabase
        .from("strings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)

      setLastPollTime(new Date())

      if (error) {
        console.error("[v0] Error polling strings table:", error)
        return
      }

      if (data && data.length > 0) {
        const row = data[0] as StringsRow

        if (lastProcessedId !== row.id) {
          console.log("[v0] New order string received:", row.content)

          setCurrentOrder(row.content)
          setIsProcessing(true)
          setLastProcessedId(row.id)

          await onOrderReceived(row.content)

          console.log("[v0] Order processed successfully")
          setHasProcessedOrder(true)
          setCurrentOrder(null)
          setIsProcessing(false)
          console.log("[v0] Polling stopped - order complete")
        }
      }
    } catch (error) {
      console.error("[v0] Error in order polling:", error)
      setIsProcessing(false)
    }
  }, [enabled, isProcessing, hasProcessedOrder, stopAfterProcessing, onOrderReceived, lastProcessedId])

  const resetPolling = useCallback(() => {
    console.log("[v0] Polling reset - ready for next order")
    setHasProcessedOrder(false)
    setCurrentOrder(null)
    setIsProcessing(false)
    setLastProcessedId(null)
  }, [])

  useEffect(() => {
    if (!enabled) return

    pollForOrders()

    const interval = setInterval(pollForOrders, pollInterval)

    return () => clearInterval(interval)
  }, [enabled, pollInterval, pollForOrders])

  return {
    currentOrder,
    isProcessing,
    lastPollTime,
    hasProcessedOrder,
    resetPolling,
  }
}
