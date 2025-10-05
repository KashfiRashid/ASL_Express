import { MENU_ITEMS } from "./menu-data"
import type { MenuItem } from "./types"

export interface ParsedOrderItem {
  item: MenuItem
  quantity: number
}

/**
 * Parses a finalized order string from the backend
 * Example input: "✅ Client 27: [{'item': 'Soft Drink', 'quantity': 2}]"
 * Returns array of parsed items with menu data
 */
export function parseOrderString(orderString: string): ParsedOrderItem[] {
  try {
    const jsonStart = orderString.indexOf("[")
    const jsonEnd = orderString.lastIndexOf("]")

    if (jsonStart === -1 || jsonEnd === -1) {
      console.error("[v0] No JSON array found in order string")
      return []
    }

    const jsonString = orderString.substring(jsonStart, jsonEnd + 1)

    // Clean up the string - replace single quotes with double quotes for valid JSON
    const cleanedString = jsonString.replace(/'/g, '"')

    console.log("[v0] Cleaned JSON string:", cleanedString)

    // Parse JSON
    const rawItems = JSON.parse(cleanedString) as Array<{ item: string; quantity: number }>

    console.log("[v0] Parsed raw items:", rawItems)

    // Map to menu items
    const parsedItems: ParsedOrderItem[] = []

    for (const rawItem of rawItems) {
      // Find matching menu item (case-insensitive, flexible matching)
      const menuItem = MENU_ITEMS.find((m) => {
        const itemName = rawItem.item.toLowerCase().trim()
        const menuName = m.name.toLowerCase()

        // Direct match or contains
        return menuName.includes(itemName) || itemName.includes(menuName)
      })

      if (menuItem && rawItem.quantity > 0) {
        parsedItems.push({
          item: menuItem,
          quantity: rawItem.quantity,
        })
        console.log("[v0] Matched item:", menuItem.name, "quantity:", rawItem.quantity)
      } else {
        console.warn("[v0] Could not match item:", rawItem.item)
      }
    }

    return parsedItems
  } catch (error) {
    console.error("[v0] Failed to parse order string:", error)
    return []
  }
}

/**
 * Alternative parser for different string formats
 * Handles formats like: "Burger x2, Fries x1, Drink x3"
 */
export function parseSimpleOrderString(orderString: string): ParsedOrderItem[] {
  try {
    const parsedItems: ParsedOrderItem[] = []

    // Split by comma
    const parts = orderString.split(",").map((s) => s.trim())

    for (const part of parts) {
      // Extract item name and quantity
      // Matches: "Burger x2" or "Burger 2" or "2x Burger"
      const match = part.match(/(?:(\d+)\s*x\s*)?([a-zA-Z\s]+?)(?:\s*x?\s*(\d+))?$/i)

      if (match) {
        const quantity = Number.parseInt(match[1] || match[3] || "1")
        const itemName = match[2].trim().toLowerCase()

        const menuItem = MENU_ITEMS.find(
          (m) => m.name.toLowerCase().includes(itemName) || itemName.includes(m.name.toLowerCase()),
        )

        if (menuItem && quantity > 0) {
          parsedItems.push({
            item: menuItem,
            quantity,
          })
        }
      }
    }

    return parsedItems
  } catch (error) {
    console.error("[v0] Failed to parse simple order string:", error)
    return []
  }
}
