import { AuroraBackground } from "@/components/ui/aurora-background"
import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { ProblemStatement } from "@/components/problem-statement"
import { Solution } from "@/components/solution"
import { Features } from "@/components/features"
import { Testimonials } from "@/components/testimonials"
import { WaitlistForm } from "@/components/waitlist-form"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <AuroraBackground className="min-h-screen overflow-auto">
      <div className="relative z-10 w-full">
        <Navbar />
        <Hero />
        <ProblemStatement />
        <Solution />
        <Features />
        <Testimonials />
        <WaitlistForm />
        <Footer />
      </div>
    </AuroraBackground>
  )
}

