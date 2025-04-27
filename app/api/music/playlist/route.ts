import { promises as fs } from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  // Construct the absolute path to the public/Music directory
  const musicDir = path.join(process.cwd(), 'public', 'Music')

  try {
    // Read directory contents
    const filenames = await fs.readdir(musicDir)

    // Filter for .mp3 files (case-insensitive) and map to public URLs
    const mp3Files = filenames
      .filter(file => /\.mp3$/i.test(file))
      .map(file => `/Music/${file}`)

    return NextResponse.json({ playlist: mp3Files })
  } catch (error) {
    console.error('Error reading music directory:', error)
    // Determine the type of error if needed, for now a generic message
    let errorMessage = 'Failed to load music playlist.'
    if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        errorMessage = 'Music directory not found.'
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Optional: Add configuration for edge runtime if preferred, 
// but default Node.js runtime is required for 'fs'
// export const runtime = 'edge' // Remove this if using 'fs' 