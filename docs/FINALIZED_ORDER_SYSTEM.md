# Finalized Order System

## Overview

This system allows your Python backend to push a complete order string to Supabase, and the frontend will automatically:
1. Poll every 5 seconds for new orders
2. Parse the order string
3. Animate through each item selection
4. Display quantity for each item
5. Show confirmation screen
6. Complete the order

## Database Setup

Run the SQL script to create the table:

\`\`\`bash
scripts/003_create_finalized_orders.sql
\`\`\`

## Order String Format

### Format 1: JSON Array (Recommended)
\`\`\`
[{'item': 'Soft Drink', 'quantity': 2}, {'item': 'Burger', 'quantity': 1}]
\`\`\`

### Format 2: Simple String
\`\`\`
Burger x2, Fries x1, Drink x3
\`\`\`

## Python Backend Example

\`\`\`python
from supabase import create_client
import os

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

# When order is finalized
order_data = "[{'item': 'Soft Drink', 'quantity': 2}, {'item': 'Burger', 'quantity': 1}]"
client_id = "Client 27"

# Insert into database
supabase.table("finalized_orders").insert({
    "client_id": client_id,
    "order_data": order_data,
    "processed": False
}).execute()

print(f"Order pushed for {client_id}")
\`\`\`

## Frontend Behavior

1. **Polling**: Checks database every 5 seconds
2. **When order found**:
   - Parses the order string
   - For each item:
     - Shows item (1.5s)
     - Shows quantity (1.5s)
     - Adds to order with animation (2s)
   - Shows confirming screen (5s)
   - Shows order complete screen
3. **Marks order as processed** in database

## Item Name Matching

The parser is flexible and matches:
- "Soft Drink" → Drink
- "Burger" → Burger
- "French Fries" or "Fries" → French Fries
- Case-insensitive
- Partial matches

## Customization

### Change Poll Interval

In `app/order/page.tsx`:
\`\`\`typescript
pollInterval: 5000, // Change to any milliseconds value
\`\`\`

### Change Table Name

In `lib/supabase-config.ts`:
\`\`\`typescript
export const SUPABASE_CONFIG = {
  tableName: "your_table_name",
  // ...
}
\`\`\`

### Add New Item Formats

In `lib/order-string-parser.ts`, add custom parsing logic.

## Testing

Insert test data:
\`\`\`sql
INSERT INTO finalized_orders (client_id, order_data) 
VALUES ('Client 27', '[{''item'': ''Soft Drink'', ''quantity'': 2}, {''item'': ''Burger'', ''quantity'': 1}]');
\`\`\`

Frontend will automatically detect and process it within 5 seconds.
