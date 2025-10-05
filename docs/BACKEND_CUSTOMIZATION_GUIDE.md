# Backend Customization Guide

This guide explains how to customize the Supabase backend integration for your gesture recognition system.

## Overview

The backend system is split into modular components that can be easily customized:

1. **`lib/supabase-config.ts`** - Database configuration
2. **`lib/command-processor.ts`** - Command mapping logic
3. **`lib/hooks/use-gesture-polling.ts`** - Polling hook (reusable)
4. **`app/order/page.tsx`** - UI component (uses the above)

---

## Step 1: Configure Your Database

Edit `lib/supabase-config.ts` to match your Supabase table structure.

### Example: Default Configuration

\`\`\`typescript
export const SUPABASE_CONFIG = {
  tableName: "gesture_commands",
  columns: {
    id: "id",
    command: "command",
    processed: "processed",
    createdAt: "created_at",
  },
  polling: {
    intervalMs: 500,        // Poll every 0.5 seconds
    processingDelayMs: 1000, // Wait 1 second after processing
  },
}
\`\`\`

### Example: Custom Table Structure

If your table is named `asl_gestures` with columns `gesture_id`, `gesture_value`, `is_processed`:

\`\`\`typescript
export const SUPABASE_CONFIG = {
  tableName: "asl_gestures",
  columns: {
    id: "gesture_id",
    command: "gesture_value",
    processed: "is_processed",
    createdAt: "timestamp",
  },
  polling: {
    intervalMs: 1000,
    processingDelayMs: 500,
  },
}
\`\`\`

---

## Step 2: Map Commands to Actions

Edit `lib/command-processor.ts` to define how string values trigger animations.

### Item Commands

Map letters to menu items:

\`\`\`typescript
const ITEM_COMMANDS: Record<string, string> = {
  B: "burger",   // "B" from database → Burger item
  F: "fries",    // "F" from database → Fries item
  D: "drink",    // "D" from database → Drink item
}
\`\`\`

**To add a new item:**
1. Add to `ITEM_COMMANDS`: `"P": "pizza"`
2. Add item to `lib/menu-data.ts`

### Quantity Commands

Map numbers to quantities:

\`\`\`typescript
const QUANTITY_COMMANDS = ["1", "2", "3"]
\`\`\`

**To support more quantities:**
\`\`\`typescript
const QUANTITY_COMMANDS = ["1", "2", "3", "4", "5"]
\`\`\`

### Finish Command

Command that completes the order:

\`\`\`typescript
const FINISH_COMMAND = "FINISH"
\`\`\`

**To change:**
\`\`\`typescript
const FINISH_COMMAND = "DONE"
\`\`\`

---

## Step 3: Understand the Flow

### Database → Frontend Flow

1. **ESP32/Python writes to Supabase:**
   \`\`\`sql
   INSERT INTO gesture_commands (command, processed) VALUES ('B', false);
   \`\`\`

2. **Frontend polls every 0.5 seconds:**
   - Queries for `processed = false`
   - Finds command "B"

3. **Command processor maps "B" → Burger:**
   - Returns `{ type: "ITEM", item: burger, nextStage: "quantity-select" }`

4. **UI transitions to quantity selection screen**

5. **Next command "2" received:**
   - Maps to quantity 2
   - Adds 2 Burgers to order
   - Shows "Added to Order!" animation

6. **Command marked as processed:**
   \`\`\`sql
   UPDATE gesture_commands SET processed = true WHERE id = 1;
   \`\`\`

---

## Step 4: Customize Animations

Edit `app/order/page.tsx` to change animation screens.

### Adding Item Animation (Lines 213-230)

Current animation shows emoji + "Added to Order!":

\`\`\`tsx
if (stage === "adding-item") {
  return (
    <div className="...">
      <div className="text-8xl">{selectedItem?.emoji}</div>
      <h2>Added to Order!</h2>
      <p>{selectedQuantity}x {selectedItem?.name}</p>
      <ThumbsUp />
    </div>
  )
}
\`\`\`

**To customize:**
- Change animation duration: Modify `setTimeout(resolve, 1500)` in `handleCommand`
- Add sound effects: Add `<audio>` element
- Change visual style: Update Tailwind classes

---

## Step 5: Testing

### Manual Testing (Without Hardware)

Use the dev controls or click items directly to test the UI flow.

### With Python Backend

1. Run SQL script to create table:
   \`\`\`bash
   # Run scripts/002_create_gesture_commands.sql
   \`\`\`

2. Start Python backend:
   \`\`\`bash
   python scripts/python_serial_backend.py
   \`\`\`

3. Insert test commands:
   \`\`\`sql
   INSERT INTO gesture_commands (command, processed) VALUES ('B', false);
   INSERT INTO gesture_commands (command, processed) VALUES ('2', false);
   INSERT INTO gesture_commands (command, processed) VALUES ('FINISH', false);
   \`\`\`

4. Watch frontend automatically process commands!

---

## Common Customizations

### Change Polling Speed

Edit `lib/supabase-config.ts`:

\`\`\`typescript
polling: {
  intervalMs: 250,  // Poll every 0.25 seconds (faster)
}
\`\`\`

### Add New Command Type

1. Add to `CommandType` in `lib/command-processor.ts`:
   \`\`\`typescript
   export type CommandType = "ITEM" | "QUANTITY" | "FINISH" | "CANCEL" | "UNKNOWN"
   \`\`\`

2. Add processing logic:
   \`\`\`typescript
   if (command === "CANCEL") {
     return {
       type: "CANCEL",
       shouldTransition: true,
       nextStage: "menu",
     }
   }
   \`\`\`

3. Handle in `app/order/page.tsx`:
   \`\`\`typescript
   if (result.type === "CANCEL") {
     setOrderItems([])
     setStage("menu")
     return
   }
   \`\`\`

---

## Troubleshooting

### Commands Not Being Processed

1. Check table exists: Run SQL script
2. Check table name matches: Verify `SUPABASE_CONFIG.tableName`
3. Check column names match: Verify `SUPABASE_CONFIG.columns`
4. Check `processed` flag: Should be `false` for new commands

### Animation Not Showing

1. Check command mapping: Verify `ITEM_COMMANDS` includes your command
2. Check stage: Command only works in correct stage (e.g., "B" only works in "menu" stage)
3. Check console logs: Look for `[v0] Processing command:` messages

---

## Architecture Diagram

\`\`\`
┌─────────────┐
│   ESP32     │ Detects gesture
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Python    │ Writes to database
│   Backend   │ INSERT INTO gesture_commands
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         Supabase Database           │
│  ┌───────────────────────────────┐  │
│  │ gesture_commands table        │  │
│  │ - id: 1                       │  │
│  │ - command: "B"                │  │
│  │ - processed: false            │  │
│  └───────────────────────────────┘  │
└──────┬──────────────────────────────┘
       │
       ▼ (Poll every 0.5s)
┌─────────────────────────────────────┐
│      Frontend (Next.js)             │
│  ┌───────────────────────────────┐  │
│  │ useGesturePolling hook        │  │
│  │ - Queries unprocessed commands│  │
│  │ - Calls processCommandString  │  │
│  │ - Updates UI stage            │  │
│  │ - Marks as processed          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ Animation Screens             │  │
│  │ - Menu                        │  │
│  │ - Quantity Selection          │  │
│  │ - Adding Item (animation)     │  │
│  │ - Confirming Order            │  │
│  │ - Order Complete              │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
\`\`\`

---

## Summary

The modular backend system makes it easy to customize:

1. **Database structure** - Edit `supabase-config.ts`
2. **Command mappings** - Edit `command-processor.ts`
3. **Polling behavior** - Already handled by `use-gesture-polling.ts`
4. **UI animations** - Edit `app/order/page.tsx`

All components are decoupled and reusable!
