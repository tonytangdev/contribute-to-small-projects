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
  const [mobileIndex, setMobileIndex] = useState(0)

  const DESKTOP_SLOTS = 10
  const MOBILE_SLOTS = 2
  const ROTATION_INTERVAL = 10000

  // Desktop: max 2 pages (20 sponsors), rotate only if >10
  const desktopPages = 2
  const shouldRotateDesktop = sponsors.length > DESKTOP_SLOTS

  // Mobile: add 1 page for placeholder
  const mobilePages = sponsors.length > MOBILE_SLOTS
    ? Math.ceil(sponsors.length / MOBILE_SLOTS) + 1
    : 1
  const shouldRotateMobile = sponsors.length > MOBILE_SLOTS

  useEffect(() => {
    if (!shouldRotateDesktop) return
    const interval = setInterval(() => {
      setDesktopIndex(prev => (prev + 1) % desktopPages)
    }, ROTATION_INTERVAL)
    return () => clearInterval(interval)
  }, [shouldRotateDesktop, desktopPages])

  useEffect(() => {
    if (!shouldRotateMobile) return
    const interval = setInterval(() => {
      setMobileIndex(prev => (prev + 1) % mobilePages)
    }, ROTATION_INTERVAL)
    return () => clearInterval(interval)
  }, [shouldRotateMobile, mobilePages])

  // Calculate visible sponsors for desktop (max 20 sponsors across 2 pages)
  const desktopStart = shouldRotateDesktop ? desktopIndex * DESKTOP_SLOTS : 0
  const desktopEnd = desktopStart + DESKTOP_SLOTS
  const desktopSponsors = sponsors.slice(desktopStart, Math.min(desktopEnd, 20))

  // Split evenly for left/right sidebars
  const half = Math.ceil(desktopSponsors.length / 2)
  const leftSponsors = desktopSponsors.slice(0, half)
  const rightSponsors = desktopSponsors.slice(half)

  // Calculate visible sponsors for mobile
  const isMobilePlaceholderPage = shouldRotateMobile && mobileIndex === mobilePages - 1
  const mobileStart = shouldRotateMobile && !isMobilePlaceholderPage ? mobileIndex * MOBILE_SLOTS : 0
  const mobileEnd = mobileStart + MOBILE_SLOTS
  const mobileSponsors = isMobilePlaceholderPage ? [] : sponsors.slice(mobileStart, mobileEnd)

  return (
    <>
      <SponsorBanner sponsors={mobileSponsors} position="top" onOpenModal={() => setIsModalOpen(true)} />
      <div className="flex justify-center">
        <SponsorSidebar sponsors={leftSponsors} position="left" onOpenModal={() => setIsModalOpen(true)} />
        <div className="flex-1 max-w-7xl">
          {children}
        </div>
        <SponsorSidebar sponsors={rightSponsors} position="right" onOpenModal={() => setIsModalOpen(true)} />
      </div>
      <SponsorBanner sponsors={mobileSponsors} position="bottom" onOpenModal={() => setIsModalOpen(true)} />
      <SponsorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stats={stats} />
    </>
  )
}
