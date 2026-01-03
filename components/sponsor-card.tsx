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
        {sponsor.logoUrl ? (
          <Image
            src={sponsor.logoUrl}
            alt={`${sponsor.name} logo`}
            fill
            className="object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
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
