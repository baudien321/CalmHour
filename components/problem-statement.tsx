"use client"

import { motion } from "framer-motion"
import { Lightbulb, Timer, Users } from "lucide-react"

export function ProblemStatement() {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3, // Stagger the animation of children
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut", // Smoother easing
      },
    },
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-zinc-100 dark:bg-zinc-800">
      <div className="container px-4 md:px-6">
        {/* Use motion.div with variants for the container */}
        <motion.div
          className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]"
          variants={containerVariants} // Apply container variants
          initial="hidden"
          whileInView="visible" // Trigger animation when in view
          viewport={{ once: true, amount: 0.3 }} // Optimize viewport settings
        >
          {/* Placeholder for image/graphic, wrapped in motion.div */}
          <motion.div
            className="flex justify-center"
            variants={itemVariants} // Apply item variants
          >
            <div className="w-full max-w-sm lg:max-w-none h-64 lg:h-auto bg-zinc-300 dark:bg-zinc-700 rounded-lg animate-pulse">
              {/* Simple placeholder styling */}
            </div>
          </motion.div>
          {/* Content section, wrapped in motion.div */}
          <motion.div
            className="flex flex-col justify-center space-y-4"
            variants={itemVariants} // Apply item variants
          >
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-zinc-900 dark:text-zinc-100">
                The Endless Scramble for Focus Time
              </h2>
              <p className="max-w-[600px] text-zinc-600 dark:text-zinc-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Your calendar is packed. Finding more than 30 minutes of
                uninterrupted time feels impossible. You try to block time, but
                meetings always creep in. Context switching drains your energy,
                and deep work remains elusive.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// // Keeping original v0 code commented for reference if needed
// import { motion } from "framer-motion"
// import Image from "next/image"
// import { Lightbulb, Timer, Users } from "lucide-react"

// export function ProblemStatement() {
//   return (
//     <section className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/60">
//       <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
//         <motion.div
//           className="space-y-4"
//           initial={{ opacity: 0, x: -50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
//             The Challenge
//           </div>
//           <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//             Fragmented Schedules Kill Deep Work
//           </h2>
//           <p className="max-w-[600px] text-zinc-700 dark:text-zinc-300 md:text-xl/relaxed">
//             In today's hyper-connected world, constant meetings and notifications make sustained focus nearly impossible.
//             Finding meaningful blocks of time for deep, concentrated work is a daily struggle.
//           </p>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
//             <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-800/50 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
//               <Timer className="h-8 w-8 mb-2 text-red-500" />
//               <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Lost Productivity</p>
//             </div>
//             <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-800/50 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
//               <Lightbulb className="h-8 w-8 mb-2 text-yellow-500" />
//               <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Reduced Creativity</p>
//             </div>
//             <div className="flex flex-col items-center text-center p-4 bg-white dark:bg-zinc-800/50 rounded-lg shadow-sm border border-zinc-100 dark:border-zinc-800">
//               <Users className="h-8 w-8 mb-2 text-blue-500" />
//               <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Team Misalignment</p>
//             </div>
//           </div>
//         </motion.div>
//         <motion.div
//           className="flex justify-center"
//           initial={{ opacity: 0, x: 50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           {/* Consider using a more descriptive image/illustration */}
//           <Image
//             src="/placeholder.svg?height=550&width=550"
//             width="550"
//             height="550"
//             alt="Fragmented Calendar Illustration"
//             className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center shadow-lg"
//           />
//         </motion.div>
//       </div>
//     </section>
//   )
// }

