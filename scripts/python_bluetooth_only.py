"""
Simplified Bluetooth-only version for ESP32
Use this if you only want Bluetooth connection

Requirements:
  pip install supabase pybluez python-dotenv

Setup:
1. Pair your ESP32 with your computer via Bluetooth
2. Find ESP32 MAC address (use Bluetooth settings or run: python -m bluetooth
3. Update BLUETOOTH_MAC below
4. Run: python python_bluetooth_only.py
"""

import os
import bluetooth
import time
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BLUETOOTH_MAC = "XX:XX:XX:XX:XX:XX"  # Your ESP32 MAC address
BLUETOOTH_PORT = 1

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def update_sensor_status(triggered: bool):
    """Update Supabase when sensor is triggered"""
    try:
        supabase.table("sensor_status").update({
            "sensor_triggered": triggered,
            "last_triggered_at": datetime.now().isoformat() if triggered else None,
            "updated_at": datetime.now().isoformat()
        }).eq("id", 1).execute()
        
        print(f"✅ Database updated: sensor_triggered = {triggered}")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    print("🚀 Starting ESP32 Bluetooth Monitor...")
    print(f"📡 Connecting to: {BLUETOOTH_MAC}")
    
    try:
        sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
        sock.connect((BLUETOOTH_MAC, BLUETOOTH_PORT))
        print("✅ Connected via Bluetooth!")
        print("👋 Waiting for sensor triggers...\n")
        
        while True:
            data = sock.recv(1024).decode('utf-8').strip()
            if data:
                print(f"📨 ESP32: {data}")
                
                if "TRIGGERED" in data.upper() or "DETECTED" in data.upper():
                    print("🎯 Sensor triggered!")
                    update_sensor_status(True)
                    time.sleep(2)
                    update_sensor_status(False)
                    print("🔄 Reset\n")
            
            time.sleep(0.1)
                
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure ESP32 is paired and MAC address is correct")
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    finally:
        if 'sock' in locals():
            sock.close()
            print("✅ Bluetooth closed")

if __name__ == "__main__":
    main()
