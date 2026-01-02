'use client'

import { useState, useEffect } from 'react'
import { Sponsor } from '@/types/sponsor'
import SponsorSidebar from './sponsor-sidebar'
import SponsorBanner from './sponsor-banner'
import SponsorModal from './sponsor-modal'

interface SponsorStats {
  activeCount: number
  availableSpots: number
  maxSpots: number
}

interface SponsorsProviderClientProps {
  sponsors: Sponsor[]
  stats: SponsorStats
  children: React.ReactNode
}

export default function SponsorsProviderClient({ sponsors, stats, children }: SponsorsProviderClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [desktopIndex, setDesktopIndex] = useState(0)

  const DESKTOP_SLOTS = 10
  const ROTATION_INTERVAL = 10000

  // Desktop: max 2 pages (20 sponsors), rotate only if >10
  const desktopPages = 2
  const shouldRotateDesktop = sponsors.length > DESKTOP_SLOTS

  useEffect(() => {
    if (!shouldRotateDesktop) return
    const interval = setInterval(() => {
      setDesktopIndex(prev => (prev + 1) % desktopPages)
    }, ROTATION_INTERVAL)
    return () => clearInterval(interval)
  }, [shouldRotateDesktop, desktopPages])

  // Calculate visible sponsors for desktop (max 20 sponsors across 2 pages)
  const desktopStart = shouldRotateDesktop ? desktopIndex * DESKTOP_SLOTS : 0
  const desktopEnd = desktopStart + DESKTOP_SLOTS
  const desktopSponsors = sponsors.slice(desktopStart, Math.min(desktopEnd, 20))

  // Split evenly for left/right sidebars
  const half = Math.ceil(desktopSponsors.length / 2)
  const leftSponsors = desktopSponsors.slice(0, half)
  const rightSponsors = desktopSponsors.slice(half)

  // Split sponsors between top and bottom banners for mobile
  const mobileHalf = Math.ceil(sponsors.length / 2)
  const topBannerSponsors = sponsors.slice(0, mobileHalf)
  const bottomBannerSponsors = sponsors.slice(mobileHalf)

  return (
    <>
      <SponsorBanner sponsors={topBannerSponsors} position="top" onOpenModal={() => setIsModalOpen(true)} />
      <div className="flex justify-center">
        <SponsorSidebar sponsors={leftSponsors} position="left" onOpenModal={() => setIsModalOpen(true)} />
        <div className="flex-1 max-w-7xl">
          {children}
        </div>
        <SponsorSidebar sponsors={rightSponsors} position="right" onOpenModal={() => setIsModalOpen(true)} />
      </div>
      <SponsorBanner sponsors={bottomBannerSponsors} position="bottom" onOpenModal={() => setIsModalOpen(true)} />
      <SponsorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stats={stats} />
    </>
  )
}
