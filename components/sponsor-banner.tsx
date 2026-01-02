'use client'

import { Sponsor } from '@/types/sponsor'
import SponsorCard from './sponsor-card'
import SponsorPlaceholder from './sponsor-placeholder'

interface SponsorBannerProps {
  sponsors: Sponsor[]
  position: 'top' | 'bottom'
  onOpenModal: () => void
}

export default function SponsorBanner({ sponsors, position, onOpenModal }: SponsorBannerProps) {
  const maxDisplay = 2
  const displaySponsors = sponsors.slice(0, maxDisplay)
  const shouldShowPlaceholder = displaySponsors.length < maxDisplay

  return (
    <div
      className={`
        xl:hidden px-4 py-3 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100
        ${position === 'top' ? 'sticky top-0 z-40 shadow-sm' : 'sticky bottom-0 z-40 shadow-sm'}
      `}
      aria-label={`${position} sponsor banner`}
    >
      <div className="flex gap-3 max-w-4xl mx-auto">
        {displaySponsors.map((sponsor) => (
          <div key={sponsor.id} className="flex-1 min-w-0">
            <SponsorCard sponsor={sponsor} variant="banner" />
          </div>
        ))}

        {shouldShowPlaceholder && (
          <div className="flex-1 min-w-0">
            <SponsorPlaceholder variant="banner" onOpenModal={onOpenModal} />
          </div>
        )}
      </div>
    </div>
  )
}
