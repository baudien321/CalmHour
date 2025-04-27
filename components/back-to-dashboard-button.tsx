'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function BackToDashboardButton() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm bg-black/20 p-3 rounded-lg"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-6 w-6" />
              <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black/70 text-white border-none">
          <p>Back to Dashboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 