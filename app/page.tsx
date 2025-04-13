// Remove default Next.js imports if present
// import Image from "next/image";

// Import the new components
// Remove AuroraBackground import
// import { AuroraBackground } from "@/components/ui/aurora-background"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ProblemStatement } from "@/components/problem-statement"
import { Solution } from "@/components/solution"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { WaitlistForm } from "@/components/waitlist-form"
import { Footer } from "@/components/footer"
// Remove framer-motion import
// import { motion } from "framer-motion"

export default function Home() {
  return (
      <div className="relative z-10 w-full flex flex-col min-h-screen">
        <Navbar />
        {/* Remove AuroraBackground wrapper and put Hero back directly */}
        <Hero />
        {/* Keep the rest of the page content */}
        <main className="flex-grow flex flex-col"> 
          <ProblemStatement />
          <Solution />
          <Features />
          <Testimonials />
          <WaitlistForm />
        </main>
        <Footer />
       </div>
  )
}

