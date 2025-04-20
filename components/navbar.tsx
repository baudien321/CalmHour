"use client"

import { useState } from "react"
import Link from "next/link"
import { Clock, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import AuthButtonClient from "./auth-button-client"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-lg bg-background/50">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2" prefetch={false}>
          <Clock className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">CalmHour</span>
        </Link>

        <nav className="hidden md:flex gap-6 items-center">
          <AuthButtonClient />
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        <div
          className={cn(
            "absolute top-16 left-0 right-0 bg-background border-b md:hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none",
          )}
        >
          <div className="container flex flex-col gap-4 px-4 py-6">
            <div className="mt-2 border-t pt-4">
              <AuthButtonClient />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

