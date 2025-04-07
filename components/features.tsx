"use client"

import { motion } from "framer-motion"
import { Calendar, LineChart, BrainCircuit, Zap, Shield, Clock } from "lucide-react"

export function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center gap-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-purple-600">
            Features Designed for Deep Work
          </h2>
          <p className="max-w-[700px] text-zinc-700 dark:text-zinc-300 md:text-xl">
            CalmHour helps you reclaim your most valuable asset: focused time for meaningful work.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-12 h-12 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold">Calendar Analysis</h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              Identifies your productivity patterns and optimal focus times based on historical calendar data.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-12 h-12 flex items-center justify-center">
              <BrainCircuit className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold">Automatic Scheduling</h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              Automatically blocks your calendar for deep work during your most productive hours.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-full w-12 h-12 flex items-center justify-center">
              <LineChart className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold">Productivity Tracking</h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              Measures and visualizes your focus time and productivity improvements over time.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="p-3 bg-violet-100 dark:bg-violet-900/20 rounded-full w-12 h-12 flex items-center justify-center">
              <Shield className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold">Focus Protection</h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              Intelligently declines or reschedules meetings that would interrupt your deep work sessions.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <div className="p-3 bg-pink-100 dark:bg-pink-900/20 rounded-full w-12 h-12 flex items-center justify-center">
              <Zap className="h-6 w-6 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold">Smart Notifications</h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              Minimizes distractions by batching notifications and only alerting you during natural break times.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="p-3 bg-teal-100 dark:bg-teal-900/20 rounded-full w-12 h-12 flex items-center justify-center">
              <Clock className="h-6 w-6 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold">Work-Life Balance</h3>
            <p className="text-zinc-700 dark:text-zinc-300">
              Ensures you have time for both deep work and personal commitments by optimizing your entire schedule.
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
          <div className="bg-gradient-to-r from-purple-600 to-blue-500 p-8 rounded-xl max-w-3xl text-white">
            <h3 className="text-2xl font-bold mb-4">Reclaim Your Productive Time</h3>
            <p className="mb-6">
              With CalmHour, you'll gain back 10+ hours of deep focus time every week, leading to higher quality work,
              reduced stress, and better work-life balance.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 inline-flex items-center gap-2">
                <span className="text-3xl font-bold">10+</span>
                <span className="text-sm">
                  hours of deep focus
                  <br />
                  reclaimed weekly
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

