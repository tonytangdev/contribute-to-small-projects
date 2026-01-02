'use client'

interface SponsorPlaceholderProps {
  variant?: 'sidebar' | 'banner'
  onOpenModal: () => void
}

export default function SponsorPlaceholder({ variant = 'sidebar', onOpenModal }: SponsorPlaceholderProps) {
  const isBanner = variant === 'banner'

  return (
    <button
      onClick={onOpenModal}
      className={`
        w-full bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-dashed border-indigo-200
        rounded-xl p-3 hover:bg-gradient-to-br hover:from-indigo-100 hover:to-blue-100
        hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5
        transition-all duration-300 group
        ${isBanner ? 'flex items-center gap-3' : 'text-center'}
      `}
    >
      <div className={isBanner ? 'w-10 h-10 flex-shrink-0 flex items-center justify-center' : 'w-12 h-12 mx-auto flex items-center justify-center'}>
        <svg className="w-6 h-6 text-indigo-400 group-hover:text-indigo-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div className={isBanner ? 'flex-1 min-w-0' : 'mt-2'}>
        <h3 className="font-bold text-indigo-700 text-xs group-hover:text-indigo-900 transition-colors">
          Your Ad Here
        </h3>
        <p className="text-[10px] text-indigo-500 mt-0.5">
          Sponsor this spot
        </p>
      </div>
      <span className={`text-[10px] text-indigo-400 uppercase tracking-wide ${isBanner ? 'flex-shrink-0' : 'block mt-1.5'}`}>
        Available
      </span>
    </button>
  )
}
