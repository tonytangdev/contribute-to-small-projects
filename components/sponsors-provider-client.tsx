'use client'

import { useState } from 'react'
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

  return (
    <>
      <SponsorBanner sponsors={sponsors} position="top" onOpenModal={() => setIsModalOpen(true)} />
      <div className="flex justify-center">
        <SponsorSidebar sponsors={sponsors} position="left" onOpenModal={() => setIsModalOpen(true)} />
        <div className="flex-1 max-w-7xl">
          {children}
        </div>
        <SponsorSidebar sponsors={sponsors} position="right" onOpenModal={() => setIsModalOpen(true)} />
      </div>
      <SponsorBanner sponsors={sponsors} position="bottom" onOpenModal={() => setIsModalOpen(true)} />
      <SponsorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} stats={stats} />
    </>
  )
}
