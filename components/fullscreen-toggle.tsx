'use client'

import React, { useState, useEffect } from 'react'
import { Maximize, Minimize } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Function to request fullscreen
  const enterFullscreen = () => {
    const element = document.documentElement // Fullscreen the whole page
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => console.error('Error attempting to enable full-screen mode:', err))
    } else if ((element as any).webkitRequestFullscreen) { /* Safari */
      (element as any).webkitRequestFullscreen()
    } else if ((element as any).msRequestFullscreen) { /* IE11 */
      (element as any).msRequestFullscreen()
    }
  }

  // Function to exit fullscreen
  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if ((document as any).webkitExitFullscreen) { /* Safari */
      (document as any).webkitExitFullscreen()
    } else if ((document as any).msExitFullscreen) { /* IE11 */
      (document as any).msExitFullscreen()
    }
  }

  // Handle button click
  const handleToggle = () => {
    if (isFullscreen) {
      exitFullscreen()
    } else {
      enterFullscreen()
    }
  }

  // Effect to listen for fullscreen changes (e.g., pressing Esc)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement || !!(document as any).webkitFullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange) // Safari

    // Initial check in case fullscreen was entered before component mount
    handleFullscreenChange()

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    }
  }, [])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="text-white/80 hover:bg-white/10 hover:text-white backdrop-blur-sm bg-black/20 p-3 rounded-lg"
      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      {isFullscreen ? (
        <Minimize className="h-6 w-6" />
      ) : (
        <Maximize className="h-6 w-6" />
      )}
      <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
    </Button>
  )
} 