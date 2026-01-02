'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sponsor } from '@/types/sponsor'
import SponsorCard from './sponsor-card'
import SponsorPlaceholder from './sponsor-placeholder'

interface SponsorRotatorProps {
  sponsors: Sponsor[]
  variant?: 'sidebar' | 'banner'
  rotationInterval?: number
  maxSpots?: number
  onOpenModal: () => void
}

export default function SponsorRotator({
  sponsors,
  variant = 'sidebar',
  rotationInterval = 10000,
  maxSpots = 20,
  onOpenModal
}: SponsorRotatorProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  // Only add ONE placeholder if there are empty spots
  const items = [...sponsors]
  const remainingSpots = maxSpots - sponsors.length
  if (remainingSpots > 0) {
    items.push(null) // Add single placeholder
  }

  const rotate = useCallback(() => {
    if (items.length <= 1) return

    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
      setIsVisible(true)
    }, 300)
  }, [items.length])

  useEffect(() => {
    if (items.length <= 1) return
    const interval = setInterval(rotate, rotationInterval)
    return () => clearInterval(interval)
  }, [rotate, rotationInterval, items.length])

  if (items.length === 0) return null

  const currentItem = items[currentIndex]

  return (
    <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {currentItem ? (
        <SponsorCard sponsor={currentItem} variant={variant} />
      ) : (
        <SponsorPlaceholder variant={variant} onOpenModal={onOpenModal} />
      )}
    </div>
  )
}
