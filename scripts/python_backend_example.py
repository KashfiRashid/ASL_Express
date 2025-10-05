"""
Example Python backend code for Arduino integration
This shows how your Python backend should update Supabase when Arduino triggers

Requirements:
  pip install supabase requests
"""

import os
from supabase import create_client, Client
from datetime import datetime

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def handle_arduino_trigger(sensor_name: str, triggered: bool):
    """
    Called when Arduino detects ultrasonic sensor trigger
    Updates Supabase database which frontend polls
    """
    try:
        # Update sensor status in Supabase
        data = supabase.table("sensor_status").update({
            "sensor_triggered": triggered,
            "last_triggered_at": datetime.now().isoformat() if triggered else None,
            "updated_at": datetime.now().isoformat()
        }).eq("id", 1).execute()
        
        print(f"[Python Backend] Sensor status updated: {data}")
        return {"success": True, "data": data}
    
    except Exception as e:
        print(f"[Python Backend] Error updating sensor: {e}")
        return {"success": False, "error": str(e)}

# Example: When Arduino sends HTTP request to your Python backend
# You would call: handle_arduino_trigger("ultrasonic", True)
