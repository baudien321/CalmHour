"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export function Solution() {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
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
        ease: "easeInOut",
      },
    },
  }

  return (
    <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-100 dark:bg-zinc-800/40">
      <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
        <motion.div
          className="space-y-4"
          variants={itemVariants}
        >
          <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
            How It Works
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-zinc-900 dark:text-zinc-100">
            Simple Steps to Uninterrupted Focus
          </h2>
          <p className="max-w-[600px] text-zinc-600 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            CalmHour seamlessly integrates with your existing calendar to find and
            protect your most valuable time.
          </p>
          <ul className="grid gap-4">
            <li className="flex items-start gap-4">
              <div className="bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Connect Your Calendar
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Securely link your Google or Outlook calendar in seconds.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Intelligent Analysis
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  CalmHour analyzes your schedule to find optimal focus blocks.
                </p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Automatic Blocking
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Focus time is automatically scheduled and protected on your calendar.
                </p>
              </div>
            </li>
          </ul>
        </motion.div>
        <motion.div
          className="flex justify-center"
          variants={itemVariants}
        >
          <Image
            src="/placeholder.svg" // Update this path
            width="550"
            height="310"
            alt="How CalmHour Works Illustration"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
          />
        </motion.div>
      </div>
    </section>
  )
}

// // Keeping original v0 code commented for reference if needed
// import { motion } from "framer-motion"
// import Image from "next/image"

// export function Solution() {
//   return (
//     <section id="how-it-works" className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-800/60">
//       <div className="container grid items-center gap-8 px-4 md:px-6 lg:grid-cols-2 lg:gap-16">
//         <motion.div
//           className="space-y-4"
//           initial={{ opacity: 0, x: -50 }}
//           whileInView={{ opacity: 1, x: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
//             How It Works
//           </div>
//           <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//             Simple Steps to Uninterrupted Focus
//           </h2>
//           <p className="max-w-[600px] text-zinc-700 dark:text-zinc-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
//             CalmHour seamlessly integrates with your existing calendar to find and protect your most valuable time.
//           </p>
//           <ul className="grid gap-4 mt-6">
//             <li className="flex items-start gap-4">
//               <div className="flex-shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">
//                 1
//               </div>
//               <div>
//                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Connect Your Calendar</h3>
//                 <p className="text-sm text-zinc-600 dark:text-zinc-400">Securely link your Google or Outlook calendar in seconds.</p>
//               </div>
//             </li>
//             <li className="flex items-start gap-4">
//               <div className="flex-shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">
//                 2
//               </div>
//               <div>
//                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Intelligent Analysis</h3>
//                 <p className="text-sm text-zinc-600 dark:text-zinc-400">CalmHour analyzes your schedule to find optimal focus blocks.</p>
//               </div>
//             </li>
//             <li className="flex items-start gap-4">
//               <div className="flex-shrink-0 bg-purple-100 text-purple-700 dark:bg-purple-800/30 dark:text-purple-300 rounded-full h-8 w-8 flex items-center justify-center font-bold">
//                 3
//               </div>
//               <div>
//                 <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Automatic Blocking</h3>
//                 <p className="text-sm text-zinc-600 dark:text-zinc-400">Focus time is automatically scheduled and protected on your calendar.</p>
//               </div>
//             </li>
//           </ul>
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
//             alt="How CalmHour Works Illustration"
//             className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center shadow-lg"
//           />
//         </motion.div>
//       </div>
//     </section>
//   )
// }

