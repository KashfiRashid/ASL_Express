export interface MenuItem {
  id: string
  name: string
  price: number
  imageUrl: string
  emoji: string
  aslSign: string // Added ASL sign description for menu display
}

export interface OrderItem extends MenuItem {
  quantity: number
  confirmed: boolean
}

export interface Order {
  orderId: string
  items: OrderItem[]
  status: "idle" | "menu" | "item-quantity" | "ordering" | "confirming" | "complete"
  subtotal: number
  tax: number
  total: number
}

export type OrderStage = "idle" | "menu" | "item-quantity" | "ordering" | "confirming" | "complete"
