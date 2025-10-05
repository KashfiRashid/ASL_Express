-- Create gesture_commands table for ESP32 → Backend → Frontend communication
CREATE TABLE IF NOT EXISTS gesture_commands (
  id SERIAL PRIMARY KEY,
  command VARCHAR(10) NOT NULL, -- "START", "B", "F", "D", "1", "2", "3", "FINISH"
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster polling queries
CREATE INDEX IF NOT EXISTS idx_gesture_commands_processed ON gesture_commands(processed, created_at);

-- Insert initial row for testing
INSERT INTO gesture_commands (command, processed) VALUES ('START', FALSE);
