import type { MenuItem } from "./types"

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "burger",
    name: "Classic Burger",
    price: 5.49,
    emoji: "🍔",
    imageUrl: "/placeholder.svg?height=200&width=200",
    aslSign: "Make a FIST (closed hand)",
  },
  {
    id: "fries",
    name: "French Fries",
    price: 2.19,
    emoji: "🍟",
    imageUrl: "/placeholder.svg?height=200&width=200",
    aslSign: "Show OPEN HAND (5 fingers spread)",
  },
  {
    id: "drink",
    name: "Soft Drink",
    price: 1.29,
    emoji: "🥤",
    imageUrl: "/placeholder.svg?height=200&width=200",
    aslSign: "Make a 'C' SHAPE (like holding a cup)",
  },
]
