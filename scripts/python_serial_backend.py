"""
Python backend that reads ESP32 data (via USB Serial or Bluetooth) and updates Supabase
This is the main script you'll run on the computer connected to ESP32

Requirements:
  pip install supabase pyserial pybluez python-dotenv

Setup:
1. Choose connection method: USB Serial or Bluetooth
2. Update configuration below
3. Run: python python_serial_backend.py
"""

import os
import serial
import time
from supabase import create_client, Client
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ============================================
# CONFIGURATION - Choose your connection method
# ============================================

CONNECTION_METHOD = "SERIAL"  # Options: "SERIAL" or "BLUETOOTH"

# Serial port configuration (for USB connection)
SERIAL_PORT = "COM3"  # Change this: COM3 (Windows), /dev/ttyUSB0 (Linux), /dev/cu.usbserial (Mac)
BAUD_RATE = 9600

# Bluetooth configuration (for Bluetooth connection)
BLUETOOTH_MAC = "XX:XX:XX:XX:XX:XX"  # Change this to your ESP32 MAC address
BLUETOOTH_PORT = 1

# ============================================

def update_sensor_status(triggered: bool):
    """Update Supabase when sensor is triggered"""
    try:
        data = supabase.table("sensor_status").update({
            "sensor_triggered": triggered,
            "last_triggered_at": datetime.now().isoformat() if triggered else None,
            "updated_at": datetime.now().isoformat()
        }).eq("id", 1).execute()
        
        print(f"✅ Database updated: sensor_triggered = {triggered}")
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def connect_bluetooth():
    """Connect to ESP32 via Bluetooth"""
    try:
        import bluetooth
        print(f"📡 Connecting to ESP32 via Bluetooth: {BLUETOOTH_MAC}")
        sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
        sock.connect((BLUETOOTH_MAC, BLUETOOTH_PORT))
        print("✅ Connected via Bluetooth!")
        return sock
    except ImportError:
        print("❌ PyBluez not installed. Run: pip install pybluez")
        return None
    except Exception as e:
        print(f"❌ Bluetooth connection error: {e}")
        print("💡 Make sure ESP32 is paired and MAC address is correct")
        return None

def read_bluetooth(sock):
    """Read data from Bluetooth socket"""
    try:
        data = sock.recv(1024).decode('utf-8').strip()
        return data
    except Exception as e:
        print(f"❌ Bluetooth read error: {e}")
        return None

def main_serial():
    """Main loop for USB Serial connection"""
    print("🚀 Starting ESP32 Serial Monitor...")
    print(f"📡 Connecting to serial port: {SERIAL_PORT}")
    
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
        time.sleep(2)
        print("✅ Connected to ESP32!")
        print("👋 Waiting for sensor triggers...\n")
        
        while True:
            if ser.in_waiting > 0:
                line = ser.readline().decode('utf-8').strip()
                print(f"📨 ESP32 says: {line}")
                
                if "TRIGGERED" in line.upper() or "DETECTED" in line.upper():
                    print("🎯 Sensor triggered! Updating database...")
                    update_sensor_status(True)
                    time.sleep(2)
                    update_sensor_status(False)
                    print("🔄 Sensor reset\n")
                
    except serial.SerialException as e:
        print(f"❌ Serial port error: {e}")
        print(f"💡 Make sure ESP32 is connected to {SERIAL_PORT}")
        print("💡 Check available ports with: python -m serial.tools.list_ports")
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("✅ Serial connection closed")

def main_bluetooth():
    """Main loop for Bluetooth connection"""
    print("🚀 Starting ESP32 Bluetooth Monitor...")
    
    sock = connect_bluetooth()
    if not sock:
        return
    
    try:
        print("👋 Waiting for sensor triggers...\n")
        
        while True:
            data = read_bluetooth(sock)
            if data:
                print(f"📨 ESP32 says: {data}")
                
                if "TRIGGERED" in data.upper() or "DETECTED" in data.upper():
                    print("🎯 Sensor triggered! Updating database...")
                    update_sensor_status(True)
                    time.sleep(2)
                    update_sensor_status(False)
                    print("🔄 Sensor reset\n")
            
            time.sleep(0.1)
                
    except KeyboardInterrupt:
        print("\n👋 Shutting down...")
    finally:
        if sock:
            sock.close()
            print("✅ Bluetooth connection closed")

def main():
    """Main entry point - routes to Serial or Bluetooth"""
    print("=" * 50)
    print("🎯 ESP32 → Supabase Bridge")
    print("=" * 50)
    print(f"Connection Method: {CONNECTION_METHOD}")
    print()
    
    if CONNECTION_METHOD == "SERIAL":
        main_serial()
    elif CONNECTION_METHOD == "BLUETOOTH":
        main_bluetooth()
    else:
        print(f"❌ Invalid CONNECTION_METHOD: {CONNECTION_METHOD}")
        print("💡 Set CONNECTION_METHOD to 'SERIAL' or 'BLUETOOTH'")

if __name__ == "__main__":
    main()
