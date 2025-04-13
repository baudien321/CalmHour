"use client"
import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"

// Update interface to extend HTMLProps
interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode
  showRadialGradient?: boolean
  // className is already part of HTMLProps
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props // Destructure remaining props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-slate-950 transition-bg",
        className
      )}
      {...props} // Add props spread
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={cn(
            `
            /* Variables should now be picked up from globals.css */

            /* Use var(--aurora) matching globals.css */
            [background-image:var(--white-gradient),var(--aurora)]
            dark:[background-image:var(--dark-gradient),var(--aurora)]

            /* Keep other styles */
            [background-size:300%,_200%]
            [background-position:50%_50%,50%_50%]
            filter blur-[10px] invert dark:invert-0 
            after:content-[""] after:absolute after:inset-0 
            /* Use var(--aurora) in after pseudo-element */
            after:[background-image:var(--white-gradient),var(--aurora)] 
            after:dark:[background-image:var(--dark-gradient),var(--aurora)]
            after:[background-size:200%,_100%]
            after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
            pointer-events-none absolute -inset-[10px] opacity-50 will-change-transform`,

            showRadialGradient &&
               `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
          )}
        ></div>
      </div>
      {children}
    </div>
  )
}

