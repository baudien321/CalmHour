'use client'

import React, { useState, useEffect, useRef } from 'react'
import FocusTimer, { FocusTimerHandles } from '@/components/focus-timer'
import LofiPlayer from '@/components/lofi-player'
import FullscreenToggle from '@/components/fullscreen-toggle'
import BackToDashboardButton from '@/components/back-to-dashboard-button'

export default function CalmVibesPage() {
  const [playlist, setPlaylist] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<FocusTimerHandles>(null)

  useEffect(() => {
    const fetchPlaylist = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/music/playlist')
        if (!response.ok) {
          let errorMsg = `Error: ${response.status}`
          try {
            const errData = await response.json()
            errorMsg = errData.error || errorMsg
          } catch (e) { /* Ignore if response body isn't JSON */ }
          throw new Error(errorMsg)
        }
        const data = await response.json()
        setPlaylist(data.playlist || [])
      } catch (err) {
        console.error('Failed to fetch playlist:', err)
        setError(err instanceof Error ? err.message : 'An unknown error occurred')
        setPlaylist([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaylist()
  }, [])

  const handlePlay = () => {
    timerRef.current?.startTimer()
  }

  const handlePause = () => {
    timerRef.current?.pauseTimer()
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0 z-[-1]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          src="/bg1.mp4"
        />
      </div>

      {/* Overlay Container with Controls */}
      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
        {/* Top Row */}
        <div className="flex justify-between items-start">
          <FocusTimer ref={timerRef} initialSeconds={0} />
          <BackToDashboardButton />
        </div>

        {/* Bottom Row - Conditionally render player based on loading/error */}
        <div className="flex justify-between items-end">
          {isLoading ? (
            <div className="text-white/50 backdrop-blur-sm bg-black/20 p-3 rounded-lg min-w-[300px]">Loading music...</div>
          ) : error ? (
            <div className="text-red-400 backdrop-blur-sm bg-black/20 p-3 rounded-lg min-w-[300px]">{error}</div>
          ) : (
            <LofiPlayer 
              playlist={playlist} 
              onPlay={handlePlay} 
              onPause={handlePause} 
            />
          )}
          <FullscreenToggle />
        </div>
      </div>
    </div>
  )
} 