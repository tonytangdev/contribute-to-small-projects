'use client'

import { useState, useEffect } from 'react'

export default function PreloadIndicator() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Listen for preload events (we'll dispatch these from the preloader)
    const handlePreloadStart = () => setIsVisible(true)
    const handlePreloadEnd = () => {
      setTimeout(() => setIsVisible(false), 1000) // Show for 1 second after preload
    }

    window.addEventListener('preload-start', handlePreloadStart)
    window.addEventListener('preload-end', handlePreloadEnd)

    return () => {
      window.removeEventListener('preload-start', handlePreloadStart)
      window.removeEventListener('preload-end', handlePreloadEnd)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-indigo-600/80 backdrop-blur-sm p-2 rounded-full shadow-lg">
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  )
}