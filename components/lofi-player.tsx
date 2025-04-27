'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
// import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid' // Assuming heroicons
import { Play, Pause, SkipForward, SkipBack } from 'lucide-react' // Use lucide-react icons and added skip icons
import { Button } from '@/components/ui/button' // Assuming shadcn Button

// Helper to format title from filename (basic example)
const formatTrackTitle = (filename: string): string => {
  // Remove path and extension, replace underscores/hyphens
  return filename
    .split('/').pop() // Get filename
    ?.replace(/\.mp3$/i, '') // Remove .mp3 extension (case-insensitive)
    .replace(/^\d+\s*/, '') // Remove leading numbers and space
    .replace(/[-_]/g, ' ') // Replace hyphens/underscores with space
    || 'Unknown Track'
}

interface LofiPlayerProps {
  playlist: string[]
  onPlay?: () => void // Add callback prop
  onPause?: () => void // Add callback prop
}

export default function LofiPlayer({
  playlist,
  onPlay, // Destructure callbacks
  onPause, // Destructure callbacks
}: LofiPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)

  const currentTrackSrc = playlist[currentTrackIndex] || ''
  const currentTrackTitle = formatTrackTitle(currentTrackSrc)

  // Updated playTrack to include callback
  const playTrack = useCallback(() => {
    audioRef.current?.play().catch(error => console.error('Audio play failed:', error))
    setIsPlaying(true)
    onPlay?.() // Call the onPlay callback
  }, [onPlay])

  // Updated pauseTrack to include callback
  const pauseTrack = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    onPause?.() // Call the onPause callback
  }, [onPause])

  const playNext = useCallback(() => {
    const nextIndex = (currentTrackIndex + 1) % playlist.length
    setCurrentTrackIndex(nextIndex)
    // Note: We don't pause/play here directly, the useEffect handles it
  }, [currentTrackIndex, playlist.length])

  const playPrevious = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
    setCurrentTrackIndex(prevIndex)
    // Note: We don't pause/play here directly, the useEffect handles it
  }, [currentTrackIndex, playlist.length])

  // Effect to load and maybe play track (no callback changes needed here)
  useEffect(() => {
    if (audioRef.current && currentTrackSrc) {
      const wasPlaying = isPlaying // Remember if it was playing before src change
      audioRef.current.src = currentTrackSrc
      audioRef.current.load()
      if (wasPlaying) {
        // Important: wait for 'canplay' or similar before playing?
        // For simplicity, attempting play directly, may need refinement
        playTrack() 
      } else {
        // Ensure state consistency if we changed tracks while paused
        setIsPlaying(false)
      }
    }
  }, [currentTrackIndex, currentTrackSrc, playTrack]) // Removed isPlaying from deps, rely on wasPlaying

  // Effect for handling track end (now calls playNext, which triggers the above effect)
  useEffect(() => {
    const audioElement = audioRef.current
    const handleEnded = () => {
      playNext()
    }
    audioElement?.addEventListener('ended', handleEnded)
    return () => {
      audioElement?.removeEventListener('ended', handleEnded)
    }
  }, [playNext])

  // Main play/pause toggle (calls playTrack/pauseTrack which have callbacks)
  const togglePlayPause = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      pauseTrack()
    } else {
      playTrack()
    }
  }

  const controlsDisabled = playlist.length === 0

  return (
    <div className="flex items-center gap-2 text-white/80 backdrop-blur-sm bg-black/20 p-3 rounded-lg w-[350px]">
      <audio ref={audioRef} preload="metadata"></audio>

      <Button variant="ghost" size="icon" onClick={playPrevious} disabled={controlsDisabled} className="text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50">
        <SkipBack className="h-5 w-5" />
        <span className="sr-only">Previous Track</span>
      </Button>

      <Button variant="ghost" size="icon" onClick={togglePlayPause} disabled={controlsDisabled} className="text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50">
        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>

      <Button variant="ghost" size="icon" onClick={playNext} disabled={controlsDisabled} className="text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50">
        <SkipForward className="h-5 w-5" />
        <span className="sr-only">Next Track</span>
      </Button>

      <div className="flex-1 overflow-hidden ml-2">
        <div 
          className={`inline-block whitespace-nowrap ${isPlaying ? 'animate-[marquee-continuous_15s_linear_infinite]' : ''}`}
          title={currentTrackTitle}
        >
          <span className="mr-8">{currentTrackTitle}</span>
          <span>{currentTrackTitle}</span>
        </div>
      </div>
    </div>
  )
} 