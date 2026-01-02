'use client'

import { Sponsor } from '@/types/sponsor'
import SponsorFlipCard from './sponsor-flip-card'
import SponsorPlaceholder from './sponsor-placeholder'

interface SponsorSidebarProps {
  sponsors: Sponsor[]
  position: 'left' | 'right'
  onOpenModal: () => void
}

export default function SponsorSidebar({ sponsors, position, onOpenModal }: SponsorSidebarProps) {
  const maxDisplay = 5
  const displaySponsors = sponsors.slice(0, maxDisplay)
  const remainingSpots = maxDisplay - displaySponsors.length

  return (
    <aside
      className={`
        hidden lg:block w-64 flex-shrink-0
        ${position === 'left' ? 'pl-8 pr-6' : 'pr-8 pl-6'}
      `}
      aria-label={`${position} sponsor sidebar`}
    >
      <div className="sticky top-8 space-y-2.5 max-h-[calc(100vh-4rem)] overflow-y-auto">
        {displaySponsors.map((sponsor, index) => (
          <SponsorFlipCard key={`${position}-slot-${index}`} sponsor={sponsor} />
        ))}

        {remainingSpots > 0 && (
          <SponsorPlaceholder variant="sidebar" onOpenModal={onOpenModal} />
        )}

        <p className="text-xs text-center text-slate-400 pt-1.5">
          <button onClick={onOpenModal} className="hover:text-indigo-600 transition-colors cursor-pointer">
            Become a sponsor
          </button>
        </p>
      </div>
    </aside>
  )
}
