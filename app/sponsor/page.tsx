'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import SponsorCard from '@/components/sponsor-card'

export default function SponsorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logoUrl: '',
    targetUrl: '',
    email: '',
  })

  const handleLogoUrlChange = (url: string) => {
    setFormData({ ...formData, logoUrl: url })
    // Validate URL before setting preview
    try {
      new URL(url)
      setLogoPreview(url)
    } catch {
      setLogoPreview('')
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      if (result.url) {
        window.location.href = result.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Back button */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Form */}
          <div>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-4 leading-tight">
                Become a Sponsor
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                Reach thousands of developers discovering their next open source contribution
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                    Company/Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="Acme Inc."
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none bg-white"
                    placeholder="Brief description of your company (optional)"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Shown on hover - keep it concise
                  </p>
                </div>

                {/* Logo URL */}
                <div>
                  <label htmlFor="logoUrl" className="block text-sm font-semibold text-slate-900 mb-2">
                    Logo URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="logoUrl"
                    value={formData.logoUrl}
                    onChange={(e) => handleLogoUrlChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Square logos work best (PNG, JPG, or SVG)
                  </p>
                </div>

                {/* Target URL */}
                <div>
                  <label htmlFor="targetUrl" className="block text-sm font-semibold text-slate-900 mb-2">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="https://example.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Where should visitors go when they click your sponsor card?
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-900 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    For payment receipt and updates
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redirecting to payment...
                    </span>
                  ) : (
                    'Continue to Payment'
                  )}
                </button>

                {/* Info */}
                <p className="text-xs text-slate-500 text-center">
                  Secure payment powered by <span className="font-semibold">Stripe</span>
                </p>
              </form>
            </div>
          </div>

          {/* Right Column - Preview & Info */}
          <div className="lg:sticky lg:top-8 space-y-6">
            {/* Live Preview */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Live Preview</h3>
              <div className="space-y-4">
                {/* Actual Sponsor Card Component */}
                <div className="max-w-[200px] mx-auto">
                  <SponsorCard
                    sponsor={{
                      id: 'preview',
                      name: formData.name || 'Your Company',
                      description: formData.description || 'Your description',
                      logoUrl: logoPreview || 'https://via.placeholder.com/150',
                      targetUrl: formData.targetUrl || '#',
                      isActive: true,
                      priority: 0,
                      startDate: new Date().toISOString(),
                      endDate: new Date().toISOString(),
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                      email: null,
                      stripeSessionId: null,
                    }}
                    variant="sidebar"
                  />
                </div>
                <p className="text-xs text-slate-500 text-center">
                  This is how your sponsor card will appear
                </p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200/60 p-6">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <h4 className="font-semibold text-slate-900">Secure & Simple</h4>
              </div>
              <p className="text-sm text-slate-600">
                Payments processed securely through Stripe. Your sponsorship activates immediately after payment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
