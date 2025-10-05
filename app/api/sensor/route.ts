import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// This endpoint is called by your Python backend when Arduino triggers
export async function POST(request: Request) {
  try {
    const { sensor, triggered } = await request.json()

    // Create Supabase client with service role for write access
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Update sensor status
    const { data, error } = await supabase
      .from("sensor_status")
      .update({
        sensor_triggered: triggered,
        last_triggered_at: triggered ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()

    if (error) {
      console.error("[v0] Sensor update error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Sensor status updated:", data)
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("[v0] Sensor API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Reset sensor status (called by frontend after navigation)
export async function DELETE() {
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { error } = await supabase
      .from("sensor_status")
      .update({
        sensor_triggered: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
