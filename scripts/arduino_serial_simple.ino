/*
 * Simple Arduino Ultrasonic Sensor for Serial Communication
 * 
 * Hardware Setup:
 * - Ultrasonic Sensor HC-SR04
 *   - VCC → 5V
 *   - GND → GND
 *   - Trig → Pin 9
 *   - Echo → Pin 10
 * 
 * This sends "TRIGGERED" via serial when someone waves at the sensor
 */

// Ultrasonic sensor pins
const int trigPin = 9;
const int echoPin = 10;

// Detection settings
const int DETECTION_DISTANCE = 30; // cm - adjust based on your needs
const int COOLDOWN_TIME = 2000;    // ms - prevent multiple triggers

unsigned long lastTriggerTime = 0;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Setup ultrasonic sensor pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  
  Serial.println("Arduino Ultrasonic Sensor Ready!");
  Serial.println("Waiting for movement...");
}

long getDistance() {
  // Send ultrasonic pulse
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Read echo and calculate distance
  long duration = pulseIn(echoPin, HIGH);
  long distance = duration * 0.034 / 2; // Convert to cm
  
  return distance;
}

void loop() {
  long distance = getDistance();
  
  // Check if someone is within detection range
  if (distance > 0 && distance < DETECTION_DISTANCE) {
    // Check cooldown to prevent multiple triggers
    unsigned long currentTime = millis();
    if (currentTime - lastTriggerTime > COOLDOWN_TIME) {
      // Send trigger message via serial
      Serial.print("TRIGGERED - Distance: ");
      Serial.print(distance);
      Serial.println(" cm");
      
      lastTriggerTime = currentTime;
    }
  }
  
  delay(100); // Check every 100ms
}
