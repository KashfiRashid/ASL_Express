"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error

function Particle({ delay, color }: { delay: number; color: string }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setPosition({
      x: Math.random() * 100,
      y: Math.random() * 100,
    })
  }, [])

  return (
    <div
      className="absolute w-2 h-2 rounded-sm opacity-60 animate-float"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        backgroundColor: color,
        animationDelay: `${delay}s`,
        animationDuration: `${3 + Math.random() * 2}s`,
      }}
    />
  )
}

export default function GreetingScreen() {
  const router = useRouter()
  const [sensorTriggered, setSensorTriggered] = useState(false)
  const [particles, setParticles] = useState<JSX.Element[]>([])
  const supabase = createClient()
  const errorLoggedRef = useRef(false)

  useEffect(() => {
    const pollSensorStatus = async () => {
      try {
        const { data, error } = await supabase.from("sensor_status").select("sensor_triggered").eq("id", 1).single()

        if (error) {
          if (!errorLoggedRef.current) {
            console.log(
              "[v0] Sensor polling disabled: Database table not set up yet. Run the SQL script to enable Arduino integration.",
            )
            errorLoggedRef.current = true
          }
          return
        }

        if (data?.sensor_triggered && !sensorTriggered) {
          console.log("[v0] Ultrasonic sensor triggered - starting order flow")
          handleSensorTrigger()

          // Reset sensor status in database
          await fetch("/api/sensor", { method: "DELETE" })
        }
      } catch (error) {
        if (!errorLoggedRef.current) {
          console.log("[v0] Sensor polling unavailable. Using manual trigger only.")
          errorLoggedRef.current = true
        }
      }
    }

    // Poll every 500ms for real-time responsiveness
    const interval = setInterval(pollSensorStatus, 500)

    return () => clearInterval(interval)
  }, [sensorTriggered])

  useEffect(() => {
    const colors = ["#3b82f6", "#ef4444", "#ffffff"]
    const generatedParticles = []
    for (let i = 0; i < 50; i++) {
      generatedParticles.push(
        <Particle key={i} delay={Math.random() * 3} color={colors[Math.floor(Math.random() * colors.length)]} />,
      )
    }
    setParticles(generatedParticles)
  }, [])

  const handleSensorTrigger = () => {
    console.log("[v0] Ultrasonic sensor triggered - starting order flow")
    setSensorTriggered(true)
    setTimeout(() => {
      router.push("/order")
    }, 1000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">{particles}</div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="relative z-10 text-center space-y-12 max-w-3xl animate-slide-up">
        {!sensorTriggered ? (
          <>
            <div className="space-y-6">
              <div className="inline-block">
                <h1 className="text-7xl md:text-8xl font-bold text-foreground tracking-tight leading-none mb-4">
                  Give a Hand
                </h1>
                <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary rounded-full" />
              </div>
              <p className="text-2xl md:text-3xl text-muted-foreground leading-relaxed font-light">
                To give everyone an equal chance to be understood.
              </p>
            </div>

            <div className="bg-card/80 backdrop-blur-sm rounded-3xl p-10 border-2 border-border shadow-2xl hover:shadow-primary/20 transition-all duration-300 animate-scale-in">
              <div className="space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-3">Order with ASL</h2>
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    Wave at the sensor to begin your accessible ordering experience
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSensorTrigger}
              size="lg"
              className="h-16 px-12 text-xl font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              Wave at Sensor
            </Button>
          </>
        ) : (
          <div className="space-y-8 animate-scale-in">
            <div className="w-28 h-28 mx-auto bg-gradient-to-br from-success to-accent rounded-full flex items-center justify-center shadow-2xl animate-pulse-glow">
              <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-3">Sensor Detected!</h2>
              <p className="text-xl text-muted-foreground">Loading your menu...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
