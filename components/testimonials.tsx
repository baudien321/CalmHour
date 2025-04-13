"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const testimonials = [
  {
    name: "Sarah Chen",
    title: "Product Manager",
    company: "Innovatech",
    quote:
      "CalmHour has been a game-changer. I used to constantly fight for focus time, but now it's automatically protected in my calendar. My productivity has soared.",
    avatar: "/placeholder-user.jpg", // Replace with actual path or remove
    fallback: "SC",
  },
  {
    name: "David Lee",
    title: "Software Engineer",
    company: "CodeCrafters",
    quote:
      "As an engineer, uninterrupted deep work is crucial. CalmHour intelligently finds those pockets and blocks them off. It's simple, effective, and brilliant.",
    avatar: "/placeholder-user.jpg", // Replace with actual path or remove
    fallback: "DL",
  },
  {
    name: "Maria Garcia",
    title: "Freelance Designer",
    company: "Self-employed",
    quote:
      "Juggling multiple clients means my schedule is chaotic. CalmHour brings order by automatically scheduling my essential design time. Highly recommended!",
    avatar: "/placeholder-user.jpg", // Replace with actual path or remove
    fallback: "MG",
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-zinc-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
            Testimonials
          </div>
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-zinc-900 dark:text-zinc-100">
            Loved by Professionals
          </h2>
          <p className="max-w-[900px] text-zinc-600 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            Hear what busy professionals are saying about how CalmHour transformed
            their productivity and focus.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <CardContent className="p-6 space-y-4">
                <blockquote className="text-lg font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
                  “{testimonial.quote}”
                </blockquote>
                <div className="flex items-center gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.fallback}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// // Keeping original v0 code commented for reference if needed
// import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
// import { motion } from "framer-motion"

// const testimonialsData = [
//   {
//     name: "Sarah L.",
//     title: "Product Manager",
//     quote: "CalmHour has been a game-changer. I used to constantly fight for focus time, but now it's automatically protected in my calendar. My productivity has soared.",
//     avatar: "/avatars/01.png",
//     fallback: "SL",
//   },
//   {
//     name: "David C.",
//     title: "Software Engineer",
//     quote: "As an engineer, uninterrupted deep work is crucial. CalmHour intelligently finds those pockets and blocks them off. It's simple, effective, and brilliant.",
//     avatar: "/avatars/02.png",
//     fallback: "DC",
//   },
//   {
//     name: "Maria G.",
//     title: "Freelance Designer",
//     quote: "Juggling multiple clients means my schedule is chaotic. CalmHour brings order by automatically scheduling my essential design time. Highly recommended!",
//     avatar: "/avatars/03.png",
//     fallback: "MG",
//   },
// ]

// export function Testimonials() {
//   return (
//     <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-100 dark:bg-zinc-800/40">
//       <div className="container px-4 md:px-6">
//         <motion.div
//           className="flex flex-col items-center justify-center space-y-4 text-center mb-12"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//         >
//           <div className="inline-block rounded-lg bg-purple-100 px-3 py-1 text-sm dark:bg-purple-800/30 text-purple-700 dark:text-purple-300">
//             Testimonials
//           </div>
//           <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-zinc-900 dark:text-zinc-100">
//             Loved by Professionals
//           </h2>
//           <p className="max-w-[900px] text-zinc-600 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
//             Hear what busy professionals are saying about how CalmHour transformed their productivity and focus.
//           </p>
//         </motion.div>
//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//           {testimonialsData.map((testimonial, index) => (
//             <motion.div
//               key={testimonial.name}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//             >
//               <Card className="bg-white dark:bg-zinc-900 shadow-lg h-full flex flex-col">
//                 <CardContent className="p-6 flex flex-col flex-grow">
//                   <blockquote className="text-lg font-semibold leading-snug text-zinc-800 dark:text-zinc-200 flex-grow">
//                     “{testimonial.quote}”
//                   </blockquote>
//                   <div className="flex items-center gap-4 mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700">
//                     <Avatar>
//                       <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
//                       <AvatarFallback>{testimonial.fallback}</AvatarFallback>
//                     </Avatar>
//                     <div>
//                       <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{testimonial.name}</p>
//                       <p className="text-sm text-zinc-600 dark:text-zinc-400">{testimonial.title}</p>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   )
// }

