/*
 * Arduino Example Code for Ultrasonic Sensor Integration
 * 
 * Hardware Setup:
 * - Ultrasonic Sensor (HC-SR04)
 * - ESP8266 or ESP32 (for WiFi)
 * 
 * This code detects when someone waves at the ultrasonic sensor
 * and sends a trigger to your Python backend
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Python backend URL (running on same network or public URL)
const char* pythonBackendUrl = "http://YOUR_PYTHON_BACKEND_IP:5000/arduino/trigger";

// Ultrasonic sensor pins
const int trigPin = D1;
const int echoPin = D2;

// Detection threshold (in cm)
const int DETECTION_DISTANCE = 30;
bool lastTriggerState = false;

void setup() {
  Serial.begin(115200);
  
  // Setup ultrasonic sensor
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

long getDistance() {
  // Send ultrasonic pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read echo
  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2; // Convert to cm
  
  return distance;
}

void sendTriggerToPython(bool triggered) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    
    http.begin(client, pythonBackendUrl);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"sensor\":\"ultrasonic\",\"triggered\":";
    payload += triggered ? "true" : "false";
    payload += "}";
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
      Serial.printf("HTTP Response: %d\n", httpCode);
      String response = http.getString();
      Serial.println(response);
    } else {
      Serial.printf("HTTP Error: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  }
}

void loop() {
  long distance = getDistance();
  
  // Check if someone is within detection range
  bool currentTriggerState = (distance > 0 && distance < DETECTION_DISTANCE);
  
  // Only send update when state changes
  if (currentTriggerState != lastTriggerState) {
    Serial.print("Distance: ");
    Serial.print(distance);
    Serial.println(" cm");
    
    if (currentTriggerState) {
      Serial.println("SENSOR TRIGGERED! Sending to Python backend...");
      sendTriggerToPython(true);
    } else {
      Serial.println("Sensor cleared");
      sendTriggerToPython(false);
    }
    
    lastTriggerState = currentTriggerState;
  }
  
  delay(100); // Check every 100ms
}
