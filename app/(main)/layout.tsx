import SearchInput from '@/components/search-input'
import LanguageSelect from '@/components/language-select'
import SponsorsProvider from '@/components/sponsors-provider'
import { getLanguages } from '@/app/repo-actions'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const languages = await getLanguages()
  const sponsorsEnabled = process.env.NEXT_PUBLIC_SPONSORS_ENABLED === 'true'

  const mainContent = (
    <main id="main-content" className="px-4 sm:px-6 py-12">
      <header className="text-center mb-16">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
            Contribute to Small Projects
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Discover open source projects with 100-600 stars — perfect for your first contributions
          </p>

          {/* Search Input */}
          <div className="flex justify-center pt-4">
            <SearchInput />
          </div>

          {/* Language Filter */}
          <div className="flex justify-center">
            <LanguageSelect languages={languages} />
          </div>
        </div>
      </header>

      {children}
    </main>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      {sponsorsEnabled ? (
        <SponsorsProvider>{mainContent}</SponsorsProvider>
      ) : (
        mainContent
      )}
    </div>
  )
}
