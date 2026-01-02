import Image from 'next/image'
import { Sponsor } from '@/types/sponsor'

interface SponsorCardProps {
  sponsor: Sponsor
  variant?: 'sidebar' | 'banner'
}

export default function SponsorCard({ sponsor, variant = 'sidebar' }: SponsorCardProps) {
  const isBanner = variant === 'banner'

  return (
    <a
      href={sponsor.targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`
        block bg-white/70 backdrop-blur-sm border border-slate-200/60
        rounded-xl p-3 hover:bg-white hover:shadow-lg
        hover:-translate-y-0.5 transition-all duration-300
        ${isBanner ? 'flex items-center gap-3' : 'text-center'}
      `}
    >
      <div className={isBanner ? 'w-10 h-10 flex-shrink-0 relative' : 'w-12 h-12 mx-auto relative'}>
        <Image
          src={sponsor.logoUrl}
          alt={`${sponsor.name} logo`}
          fill
          className="object-contain"
        />
      </div>
      <div className={isBanner ? 'flex-1 min-w-0' : 'mt-2'}>
        <h3 className="font-bold text-slate-800 text-xs">{sponsor.name}</h3>
        {sponsor.description && (
          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{sponsor.description}</p>
        )}
      </div>
      <span className={`text-[10px] text-slate-400 uppercase tracking-wide ${isBanner ? 'flex-shrink-0' : 'block mt-1.5'}`}>
        Sponsor
      </span>
    </a>
  )
}
