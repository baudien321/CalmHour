"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Hero() {
  return (
    <section className="relative w-full h-[80vh] md:h-[70vh] flex items-center justify-center text-center px-4 
      [background-image:linear-gradient(to_right,theme(colors.purple.500),theme(colors.lime.300),theme(colors.indigo.500),theme(colors.purple.500))]
      dark:[background-image:linear-gradient(to_right,theme(colors.purple.700),theme(colors.lime.500),theme(colors.indigo.700),theme(colors.purple.700))]
      [background-size:400%_auto]
      animate-gradient-shift
      ">
      {/* Background elements if any - handled by AuroraBackground wrapper */}
      <motion.div
        className="relative z-10 space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-zinc-900 dark:text-zinc-100">
          Stop Losing Time.
          <br className="hidden md:block" />
          Start Deep Work.
        </h1>
        <p className="mx-auto max-w-[700px] text-zinc-600 dark:text-zinc-300 md:text-xl">
          CalmHour intelligently analyzes your calendar and automatically
          schedules uninterrupted focus blocks, so you can finally achieve deep
          work without the constant battle for time.
        </p>
        <motion.div
          className="space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
            {/* Link to Waitlist section or potentially Login/Dashboard if logged in */}
            <Link href="#waitlist">Join the Waitlist</Link>
          </Button>
          {/* Optional secondary action */}
          {/*
          <Button asChild variant="outline" size="lg">
            <Link href="#how-it-works">Learn More</Link>
          </Button>
          */}
        </motion.div>
      </motion.div>
    </section>
  )
}

// // Keeping original v0 code commented for reference if needed
// import { motion } from "framer-motion"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"

// export function Hero() {
//   return (
//     <section className="relative w-full h-[85vh] flex items-center justify-center text-center overflow-hidden px-4">
//       {/* Aurora background is applied by the wrapper in page.tsx */}
//       <motion.div
//         className="relative z-10 flex flex-col items-center gap-6"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.8 }}
//       >
//         <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-zinc-900 dark:text-white">
//           Stop Losing Time.<br className="hidden md:block" /> Start Deep Work.
//         </h1>
//         <p className="max-w-2xl text-lg text-zinc-700 dark:text-zinc-300 md:text-xl">
//           CalmHour intelligently analyzes your calendar and automatically schedules uninterrupted focus blocks, so you can
//           finally achieve deep work without the constant battle for time.
//         </p>
//         <motion.div
//           className="flex flex-col sm:flex-row gap-4"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8, delay: 0.2 }}
//         >
//           <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg">
//             <Link href="#waitlist">Join the Waitlist</Link>
//           </Button>
//           <Button asChild variant="outline" size="lg" className="bg-white/80 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800">
//             <Link href="#how-it-works">How It Works</Link>
//           </Button>
//         </motion.div>
//       </motion.div>
//     </section>
//   )
// }

