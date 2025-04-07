"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <motion.div
          className="flex flex-col items-center gap-4 text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-purple-600">
            What Our Early Users Say
          </h2>
          <p className="max-w-[700px] text-zinc-700 dark:text-zinc-300 md:text-xl">
            Hear from professionals who've transformed their workday with CalmHour.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src="/placeholder.svg?height=100&width=100" alt="User avatar" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold">Sarah J.</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Product Manager</p>
              </div>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 italic">
              "CalmHour has transformed my workday. I now have dedicated blocks for deep work, and my team respects
              these times. My productivity has increased by at least 30%."
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src="/placeholder.svg?height=100&width=100" alt="User avatar" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold">Michael T.</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Software Engineer</p>
              </div>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 italic">
              "As a developer, context switching kills my productivity. CalmHour has given me 3-hour blocks of
              uninterrupted coding time, and my output has never been better."
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col gap-4 p-6 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src="/placeholder.svg?height=100&width=100" alt="User avatar" fill className="object-cover" />
              </div>
              <div>
                <h4 className="font-bold">Elena R.</h4>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Marketing Director</p>
              </div>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 italic">
              "CalmHour has helped me balance strategic thinking with team availability. I'm less stressed and more
              creative now that I have protected time for deep work."
            </p>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

