"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { AlertCircle, Clock, BrainCircuit } from "lucide-react"

export function ProblemStatement() {
  return (
    <section className="w-full py-12 md:py-24 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center gap-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-purple-600">
            The Hidden Cost of Interruptions
          </h2>
          <p className="max-w-[700px] text-zinc-700 dark:text-zinc-300 md:text-xl">
            Knowledge workers lose up to 23 minutes of focus time with each interruption, costing hours of productivity
            every day.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <motion.div
            className="flex flex-col items-center gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-bold">Meeting Overwhelm</h3>
            <p className="text-zinc-700 dark:text-zinc-300 text-center">
              Back-to-back meetings fragment your day, leaving no room for focused work.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-full">
              <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold">Constant Interruptions</h3>
            <p className="text-zinc-700 dark:text-zinc-300 text-center">
              Slack messages, emails, and notifications derail your concentration.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
              <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold">Context Switching</h3>
            <p className="text-zinc-700 dark:text-zinc-300 text-center">
              Jumping between tasks costs up to 40% of your productive time.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="mt-16 flex justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-full max-w-3xl h-[300px] rounded-xl overflow-hidden shadow-xl">
            <Image
              src="/placeholder.svg?height=600&width=1200"
              alt="Fragmented calendar with no focus time"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
              <p className="text-white p-6 text-lg font-medium">
                The average knowledge worker's calendar: fragmented and chaotic
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

