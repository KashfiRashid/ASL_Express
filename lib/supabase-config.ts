/**
 * SUPABASE CONFIGURATION TEMPLATE
 *
 * Modify these values to match your Supabase table structure.
 * This makes it easy to change database schema without touching component code.
 */

export const SUPABASE_CONFIG = {
  // Table name where gesture commands are stored
  tableName: "gesture_commands",

  // Column names in your table
  columns: {
    id: "id", // Primary key column
    command: "command", // String value column (e.g., "B", "1", "FINISH")
    processed: "processed", // Boolean flag to track if command was processed
    createdAt: "created_at", // Timestamp column (optional)
  },

  // Polling configuration
  polling: {
    intervalMs: 500, // Poll every 0.5 seconds
    processingDelayMs: 1000, // Wait 1 second after processing each command
  },
}

/**
 * EXAMPLE: If your table structure is different, modify like this:
 *
 * export const SUPABASE_CONFIG = {
 *   tableName: "my_custom_table",
 *   columns: {
 *     id: "row_id",
 *     command: "gesture_value",
 *     processed: "is_processed",
 *     createdAt: "timestamp",
 *   },
 *   polling: {
 *     intervalMs: 1000,
 *     processingDelayMs: 500,
 *   },
 * }
 */
