-- Table for finalized order strings from backend
-- Backend pushes complete order data here
-- Frontend polls every 5 seconds and processes

CREATE TABLE IF NOT EXISTS finalized_orders (
  id SERIAL PRIMARY KEY,
  client_id VARCHAR(50),
  order_data TEXT, -- Example: "[{'item': 'Soft Drink', 'quantity': 2}, {'item': 'Burger', 'quantity': 1}]"
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_finalized_orders_processed ON finalized_orders(processed);

-- Example insert (for testing)
-- INSERT INTO finalized_orders (client_id, order_data) 
-- VALUES ('Client 27', '[{''item'': ''Soft Drink'', ''quantity'': 2}, {''item'': ''Burger'', ''quantity'': 1}]');
