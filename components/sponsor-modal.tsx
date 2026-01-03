'use client'

import { useEffect, useState } from 'react'

interface SponsorStats {
  activeCount: number
  availableSpots: number
  maxSpots: number
}

interface SponsorModalProps {
  isOpen: boolean
  onClose: () => void
  stats: SponsorStats
}

export default function SponsorModal({ isOpen, onClose, stats }: SponsorModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!mounted || !isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-2">
            Sponsor This Platform
          </h2>
          <p className="text-slate-600 mb-6">
            Reach developers looking for their next open source contribution
          </p>

          {/* Availability */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border border-slate-200/60 rounded-xl mb-6">
            <div>
              <p className="text-sm text-slate-600">Available spots</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.availableSpots} of {stats.maxSpots}</p>
            </div>
            {stats.availableSpots === 0 && (
              <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                All filled
              </div>
            )}
          </div>

          {/* CTA */}
          <a
            href="/sponsor"
            className="block w-full py-3 px-4 bg-indigo-600 text-white text-center font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Become a Sponsor
          </a>
        </div>
      </div>
    </div>
  )
}
