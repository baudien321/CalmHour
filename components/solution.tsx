"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function Solution() {
  return (
    <section id="how-it-works" className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center gap-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-purple-600">
            Intelligent Focus Time Scheduling
          </h2>
          <p className="max-w-[700px] text-zinc-700 dark:text-zinc-300 md:text-xl">
            CalmHour analyzes your calendar patterns to automatically suggest and block optimal focus time slots.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-12">
          <motion.div
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2 mt-1">
                  <span className="font-bold text-purple-600">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Smart Calendar Analysis</h3>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    CalmHour analyzes your past calendar data to identify your most productive hours and natural work
                    patterns.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2 mt-1">
                  <span className="font-bold text-purple-600">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Automatic Focus Blocks</h3>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    Based on your productivity patterns, CalmHour automatically schedules and protects deep work
                    sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-100 dark:bg-purple-900/20 rounded-full p-2 mt-1">
                  <span className="font-bold text-purple-600">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Intelligent Rescheduling</h3>
                  <p className="text-zinc-700 dark:text-zinc-300">
                    When meetings conflict with focus time, CalmHour suggests optimal alternatives to preserve your deep
                    work.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="order-1 lg:order-2 relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-xl"></div>

              <div className="relative bg-white dark:bg-zinc-800 rounded-xl overflow-hidden shadow-xl">
                <div className="p-1 bg-gradient-to-r from-purple-500 to-blue-500">
                  <div className="h-6 flex items-center px-3 gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    alt="Calendar with optimized focus blocks"
                    width={800}
                    height={600}
                    className="rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-12 bg-white/90 dark:bg-zinc-800/90 p-4 rounded-lg shadow-lg border border-purple-200 dark:border-purple-900/20">
              <p className="text-purple-600 font-medium flex items-center gap-2">
                <span>2 hours of deep work scheduled</span>
                <ArrowRight className="h-4 w-4" />
              </p>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="mt-20 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 p-8 rounded-xl max-w-3xl">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4 text-purple-600">Before & After</h3>
                <p className="text-zinc-700 dark:text-zinc-300">
                  See how CalmHour transforms a chaotic calendar into structured, productive days with protected focus
                  time.
                </p>
              </div>
              <div className="flex-1">
                <div className="relative h-[200px]">
                  <Image
                    src="/placeholder.svg?height=400&width=600"
                    alt="Before and after calendar comparison"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

