"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

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
    <section
      id="waitlist"
      className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-transparent to-purple-100/50 dark:to-purple-900/30"
    >
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-zinc-900 dark:text-zinc-100">
              Ready to Reclaim Your Focus?
            </h2>
            <p className="max-w-[600px] text-zinc-600 dark:text-zinc-400 md:text-xl">
              Join the waitlist for CalmHour and be the first to know when we launch.
              Early access perks await!
            </p>
          </div>
          <Card className="w-full max-w-md shadow-lg dark:bg-zinc-800/50">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 sr-only"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900"
                  />
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                  Join Waitlist
                </Button>
              </form>
              <p className="mt-4 text-xs text-zinc-500 dark:text-zinc-400">
                We respect your privacy. No spam, unsubscribe anytime.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

