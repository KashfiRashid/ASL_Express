"use client"

/**
 * GESTURE POLLING HOOK
 *
 * Reusable hook that polls Supabase for new commands and processes them.
 * This hook handles all the backend communication logic.
 */

import { useEffect, useRef, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { SUPABASE_CONFIG } from "@/lib/supabase-config"

export interface GestureCommand {
  id: number
  command: string
  processed: boolean
  created_at?: string
}

export interface UseGesturePollingOptions {
  onCommandReceived: (command: string) => Promise<void>
  enabled?: boolean
}

export function useGesturePolling({ onCommandReceived, enabled = true }: UseGesturePollingOptions) {
  const [currentCommand, setCurrentCommand] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastProcessedId, setLastProcessedId] = useState<number>(0)
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const processingRef = useRef(false)

  useEffect(() => {
    if (!enabled) return

    const supabase = createBrowserClient()
    const config = SUPABASE_CONFIG

    const pollCommands = async () => {
      // Skip if already processing a command
      if (processingRef.current) return

      try {
        // Query for unprocessed commands
        const { data, error } = await supabase
          .from(config.tableName)
          .select("*")
          .eq(config.columns.processed, false)
          .gt(config.columns.id, lastProcessedId)
          .order(config.columns.id, { ascending: true })
          .limit(1)

        if (error) {
          console.log("[v0] Polling error:", error.message)
          return
        }

        if (data && data.length > 0) {
          const commandRow = data[0]
          const commandValue = commandRow[config.columns.command]

          console.log("[v0] Received command:", commandValue)

          // Set processing state
          processingRef.current = true
          setIsProcessing(true)
          setCurrentCommand(commandValue)

          // Process the command (call user's handler)
          await onCommandReceived(commandValue)

          // Mark as processed in database
          await supabase
            .from(config.tableName)
            .update({ [config.columns.processed]: true })
            .eq(config.columns.id, commandRow[config.columns.id])

          setLastProcessedId(commandRow[config.columns.id])

          // Wait before resuming polling
          await new Promise((resolve) => setTimeout(resolve, config.polling.processingDelayMs))

          // Clear processing state
          processingRef.current = false
          setIsProcessing(false)
          setCurrentCommand("")
        }
      } catch (err) {
        console.log("[v0] Polling exception:", err)
        processingRef.current = false
        setIsProcessing(false)
      }
    }

    // Start polling interval
    pollingIntervalRef.current = setInterval(pollCommands, config.polling.intervalMs)

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [enabled, lastProcessedId, onCommandReceived])

  return {
    currentCommand,
    isProcessing,
  }
}
