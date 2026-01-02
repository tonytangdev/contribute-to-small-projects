'use client'

import { Sponsor } from '@/types/sponsor'
import SponsorRotator from './sponsor-rotator'

interface SponsorBannerProps {
  sponsors: Sponsor[]
  position: 'top' | 'bottom'
  onOpenModal: () => void
}

export default function SponsorBanner({ sponsors, position, onOpenModal }: SponsorBannerProps) {
  return (
    <div
      className={`
        xl:hidden px-4 py-3 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
        ${position === 'top' ? 'sticky top-0 z-40 shadow-sm' : 'sticky bottom-0 z-40 shadow-sm'}
      `}
      aria-label={`${position} sponsor banner`}
    >
      <SponsorRotator sponsors={sponsors} variant="banner" onOpenModal={onOpenModal} maxSpots={10} />
    </div>
  )
}
