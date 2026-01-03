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
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-all duration-200 hover:scale-110"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header with Gradient */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 px-8 sm:px-12 pt-12 pb-16">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Premium Sponsorship
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
              Sponsor Our Platform
            </h2>
            <p className="text-lg text-white/90 leading-relaxed max-w-2xl">
              Reach thousands of developers discovering their next open source contribution
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 sm:px-12 py-10 space-y-8">

          {/* Availability Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-2xl p-6 shadow-sm">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/30 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Spot Availability</h3>
                  <p className="text-sm text-slate-600">Limited slots available</p>
                </div>
                <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-green-200">
                  <div className="text-3xl font-bold text-green-600">{stats.availableSpots}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wide">Available</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
                  <span className="text-slate-700 font-medium">{stats.availableSpots} of {stats.maxSpots} spots open</span>
                </div>
              </div>

              {stats.availableSpots === 0 && (
                <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 font-medium">
                    ⏳ All spots currently filled. Join the waitlist to be notified when a spot opens.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* How It Works */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">How It Works</h3>
            <div className="grid gap-4">
              <div className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Desktop Sidebars</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Your brand appears in rotating sponsor slots on left and right sidebars</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Mobile Banners</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Top and bottom banner placements on mobile devices for maximum visibility</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-100 rounded-xl text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 mb-1">Fair Rotation</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">All sponsors rotate every 10 seconds ensuring equal visibility and engagement</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Why Sponsor?</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Targeted Developer Audience</p>
                  <p className="text-xs text-slate-500 mt-0.5">Reach engaged open source contributors</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">High Visibility Placement</p>
                  <p className="text-xs text-slate-500 mt-0.5">Premium spots on all pages</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Quality Traffic</p>
                  <p className="text-xs text-slate-500 mt-0.5">Developers actively seeking projects</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-green-100 rounded-full">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Simple Integration</p>
                  <p className="text-xs text-slate-500 mt-0.5">Easy setup, instant visibility</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-center shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Secure your sponsor spot and start reaching developers today
              </p>
              <a
                href="/sponsor"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 hover:shadow-2xl hover:scale-105 transition-all duration-200 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Become a Sponsor
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
