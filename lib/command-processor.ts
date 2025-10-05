/**
 * COMMAND PROCESSOR - Maps string values to actions
 *
 * This file defines how each command string triggers animations and screen transitions.
 * Modify the command mappings to match your gesture recognition system.
 */

import type { MenuItem } from "./types"
import { MENU_ITEMS } from "./menu-data"

export type CommandType = "ITEM" | "QUANTITY" | "FINISH" | "UNKNOWN"

export interface CommandResult {
  type: CommandType
  item?: MenuItem
  quantity?: number
  shouldTransition: boolean
  nextStage?: string
}

/**
 * ITEM COMMAND MAPPING
 * Map single letters to menu items
 *
 * Modify this to match your gesture system:
 * - "B" = Burger
 * - "F" = Fries
 * - "D" = Drink
 */
const ITEM_COMMANDS: Record<string, string> = {
  B: "burger",
  F: "fries",
  D: "drink",
}

/**
 * QUANTITY COMMAND MAPPING
 * Map numbers to quantities
 */
const QUANTITY_COMMANDS = ["1", "2", "3"]

/**
 * FINISH COMMAND
 * Command that completes the order
 */
const FINISH_COMMAND = "FINISH"

/**
 * Process a command string and return the action to take
 *
 * @param command - String value from database (e.g., "B", "2", "FINISH")
 * @param currentStage - Current UI stage
 * @returns CommandResult with action details
 */
export function processCommandString(command: string, currentStage: string): CommandResult {
  // Handle item selection commands
  if (ITEM_COMMANDS[command] && currentStage === "menu") {
    const itemId = ITEM_COMMANDS[command]
    const item = MENU_ITEMS.find((m) => m.id === itemId)

    if (item) {
      return {
        type: "ITEM",
        item,
        shouldTransition: true,
        nextStage: "quantity-select",
      }
    }
  }

  // Handle quantity selection commands
  if (QUANTITY_COMMANDS.includes(command) && currentStage === "quantity-select") {
    const quantity = Number.parseInt(command)

    return {
      type: "QUANTITY",
      quantity,
      shouldTransition: true,
      nextStage: "adding-item",
    }
  }

  // Handle finish command
  if (command === FINISH_COMMAND) {
    return {
      type: "FINISH",
      shouldTransition: true,
      nextStage: "confirming",
    }
  }

  // Unknown command
  return {
    type: "UNKNOWN",
    shouldTransition: false,
  }
}

/**
 * CUSTOMIZATION GUIDE:
 *
 * To add new commands:
 * 1. Add to ITEM_COMMANDS mapping (e.g., "P": "pizza")
 * 2. Add corresponding item to menu-data.ts
 * 3. Update processCommandString logic if needed
 *
 * To change quantity range:
 * 1. Modify QUANTITY_COMMANDS array (e.g., ["1", "2", "3", "4", "5"])
 *
 * To add new command types:
 * 1. Add new CommandType (e.g., "CANCEL", "MODIFY")
 * 2. Add processing logic in processCommandString
 * 3. Handle in component
 */
