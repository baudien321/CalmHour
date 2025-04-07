"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2 } from "lucide-react"

export function WaitlistForm() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the email to your backend
    console.log("Email submitted:", email)
    setSubmitted(true)
  }

  return (
    <section id="waitlist" className="w-full py-12 md:py-24 bg-gradient-to-r from-purple-600 to-blue-500 text-white">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center gap-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Join the Waitlist for Early Access
          </h2>
          <p className="max-w-[700px] md:text-xl">
            Be among the first to experience CalmHour and reclaim your deep focus time.
          </p>
        </motion.div>

        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                />
              </div>
              <Button type="submit" className="w-full bg-white text-purple-600 hover:bg-white/90">
                Join Waitlist
              </Button>
            </form>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-2">You're on the list!</h3>
              <p>Thank you for joining our waitlist. We'll notify you when CalmHour is ready for early access.</p>
            </div>
          )}
          <p className="text-xs text-center mt-4 text-white/70">
            We respect your privacy and will never share your information.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

