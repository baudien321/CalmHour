"use client"

import { BarChart, BrainCircuit, CalendarCheck, Clock } from "lucide-react"

const features = [
  {
    icon: <CalendarCheck className="h-10 w-10 text-purple-600 bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg" />,
    title: "Intelligent Calendar Analysis",
    description:
      "CalmHour scans your existing schedule, identifying patterns and optimal slots for deep, focused work.",
  },
  {
    icon: <Clock className="h-10 w-10 text-purple-600 bg-purple-100 dark:bg-purple-800/30 p-2 rounded-lg" />,
    title: "Automatic Focus Blocking",
    description:
      "We automatically schedule and protect your focus time directly on your calendar, making it visible to colleagues.",
  },
  {
    icon: <BrainCircuit className="h-10 w-10 text-blue-600 bg-blue-100 dark:bg-blue-800/30 p-2 rounded-lg" />,
    title: "Adaptive Scheduling",
    description:
      "CalmHour learns your work patterns and preferences over time, suggesting even better focus slots.",
  },
]

export function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900/60">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
            Key Features
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-zinc-900 dark:text-zinc-100">
            Your Focus Time, Automated
          </h2>
          <p className="max-w-[900px] text-zinc-600 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Discover how CalmHour empowers you to achieve deep work without the
            scheduling hassle.
          </p>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="grid gap-4 p-6 rounded-lg bg-white dark:bg-zinc-800/50 shadow-sm border border-zinc-200 dark:border-zinc-800"
            >
              {feature.icon}
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {feature.title}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// // Keeping original v0 code commented for reference if needed
// import { motion } from "framer-motion"
// import { BarChart, BrainCircuit, CalendarCheck, Clock } from "lucide-react"

// const featuresData = [
//   {
//     icon: CalendarCheck,
//     title: "Intelligent Calendar Analysis",
//     description: "CalmHour scans your existing schedule, identifying patterns and optimal slots for deep, focused work.",
//     color: "text-purple-500",
//     bg: "bg-purple-100 dark:bg-purple-900/30",
//   },
//   {
//     icon: Clock,
//     title: "Automatic Focus Blocking",
//     description: "We automatically schedule and protect your focus time directly on your calendar, making it visible to colleagues.",
//     color: "text-green-500",
//     bg: "bg-green-100 dark:bg-green-900/30",
//   },
//   {
//     icon: BrainCircuit,
//     title: "Adaptive Scheduling",
//     description: "CalmHour learns your work patterns and preferences over time, suggesting even better focus slots.",
//     color: "text-blue-500",
//     bg: "bg-blue-100 dark:bg-blue-900/30",
//   },
//   // Optional 4th feature for layout balance if needed
//   // {
//   //   icon: BarChart,
//   //   title: "Productivity Insights",
//   //   description: "(Coming Soon) Understand where your time goes and how much focus time you're reclaiming.",
//   //   color: "text-orange-500",
//   //   bg: "bg-orange-100 dark:bg-orange-900/30",
//   // },
// ]

// export function Features() {
//   return (
//     <section id="features" className="w-full py-12 md:py-24 bg-gradient-to-b from-white to-purple-50 dark:from-zinc-900 dark:to-purple-900/20">
//       <div className="container px-4 md:px-6">
//         <motion.div
//           className="flex flex-col items-center gap-4 text-center mb-10"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
//             Features
//           </div>
//           <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
//             Your Focus Time, Automated
//           </h2>
//           <p className="max-w-[700px] text-zinc-700 dark:text-zinc-300 md:text-xl">
//             Discover how CalmHour empowers you to achieve deep work without the scheduling hassle.
//           </p>
//         </motion.div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
//           {featuresData.map((feature, index) => (
//             <motion.div
//               key={feature.title}
//               className="flex flex-col gap-4 p-6 bg-white dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl shadow-sm border border-zinc-100 dark:border-zinc-800"
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//             >
//               <div className={`p-3 rounded-full ${feature.bg} w-fit`}>
//                 <feature.icon className={`h-8 w-8 ${feature.color}`} />
//               </div>
//               <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{feature.title}</h3>
//               <p className="text-zinc-700 dark:text-zinc-300">{feature.description}</p>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

