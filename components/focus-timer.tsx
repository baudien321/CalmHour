'use client' // Timers require client-side state and effects

import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const paddedHours = String(hours).padStart(2, '0')
  const paddedMinutes = String(minutes).padStart(2, '0')
  const paddedSeconds = String(seconds).padStart(2, '0')

  return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`
}

// Define the methods exposed by the timer
export interface FocusTimerHandles {
  startTimer: () => void
  pauseTimer: () => void
  // Add resetTimer if needed later
}

interface FocusTimerProps {
  initialSeconds?: number
}

const FocusTimer = forwardRef<FocusTimerHandles, FocusTimerProps>((
  { initialSeconds = 0 }, 
  ref
) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Effect to handle the interval
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prevSeconds => prevSeconds + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Cleanup interval on component unmount or if isActive changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive])

  // Expose control methods via ref
  useImperativeHandle(ref, () => ({
    startTimer: () => setIsActive(true),
    pauseTimer: () => setIsActive(false),
  }))

  return (
    <div className="font-mono text-4xl text-white/80 backdrop-blur-sm bg-black/20 p-3 rounded-lg">
      {formatTime(elapsedSeconds)}
    </div>
  )
})

FocusTimer.displayName = 'FocusTimer' // Add display name for DevTools

export default FocusTimer 