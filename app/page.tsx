import Link from 'next/link'
import type { Metadata } from 'next'
import RepoCard from '@/components/repo-card'
import LanguageSelect from '@/components/language-select'
import SearchInput from '@/components/search-input'
import PaginationPreloader from '@/components/pagination-preloader'
import PreloadIndicator from '@/components/preload-indicator'
import SponsorsProvider from '@/components/sponsors-provider'

// Enable ISR for better performance
export const revalidate = 300 // Revalidate every 5 minutes

export async function generateMetadata({ searchParams }: HomeProps): Promise<Metadata> {
  const params = await searchParams
  const language = params.language
  const search = params.search
  const page = parseInt(params.page || '1', 10)

  let title = 'Contribute to Small Projects'
  let description = 'Discover small open source projects (100-600 stars) perfect for your first contributions'

  if (language && search) {
    title = `${language} Projects matching "${search}"`
    description = `Browse ${language} open source projects matching "${search}" with 100-600 stars - perfect for beginners`
  } else if (language) {
    title = `${language} Projects`
    description = `Browse ${language} open source projects with 100-600 stars - perfect for first-time contributors`
  } else if (search) {
    title = `Projects matching "${search}"`
    description = `Browse open source projects matching "${search}" with 100-600 stars - ideal for beginner contributions`
  } else if (page > 1) {
    title = `Projects - Page ${page}`
    description = `Discover more small open source projects (100-600 stars) - page ${page}`
  }

  const url = new URL('https://www.contribute-to-small-projects.com')
  if (language) url.searchParams.set('language', language)
  if (search) url.searchParams.set('search', search)
  if (page > 1) url.searchParams.set('page', page.toString())

  const baseUrl = 'https://www.contribute-to-small-projects.com'
  const alternates: Metadata['alternates'] = {
    canonical: url.toString(),
  }

  // Add rel prev/next for pagination
  if (page > 1) {
    const prevUrl = new URL(baseUrl)
    if (language) prevUrl.searchParams.set('language', language)
    if (search) prevUrl.searchParams.set('search', search)
    if (page > 2) prevUrl.searchParams.set('page', (page - 1).toString())
    alternates.types = { ...alternates.types, 'prev': prevUrl.toString() }
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: url.toString(),
    },
    twitter: {
      title,
      description,
    },
    alternates,
  }
}

interface Repository {
  id: string
  name: string
  owner: string
  description: string | null
  language: string | null
  stars: number
  contributors: number | null
  githubUrl: string
  lastUpdated: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface RepositoryResponse {
  repositories: Repository[]
  pagination: PaginationInfo
}

async function getRepositories(page = 1, language?: string, search?: string): Promise<RepositoryResponse> {
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '25'
    })
    
    if (language) {
      params.set('language', language)
    }
    
    if (search) {
      params.set('search', search)
    }
    
    const response = await fetch(`${baseUrl}/api/repos?${params}`, {
      next: { revalidate: 300 } // Revalidate every 5 minutes
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return {
      repositories: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 25,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  }
}

async function getLanguages(): Promise<string[]> {
  try {
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/languages`, {
      next: { revalidate: 3600 } // Revalidate every 1 hour
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch languages')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching languages:', error)
    return []
  }
}

interface HomeProps {
  searchParams: Promise<{ page?: string, language?: string, search?: string }>
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const currentPage = parseInt(params.page || '1', 10)
  const selectedLanguage = params.language
  const searchTerm = params.search
  const data = await getRepositories(currentPage, selectedLanguage, searchTerm)
  const languages = await getLanguages()
  const { repositories, pagination } = data

  const baseUrl = 'https://www.contribute-to-small-projects.com'

  // Build breadcrumb items
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl }
  ]
  if (selectedLanguage) {
    breadcrumbItems.push({ '@type': 'ListItem', position: 2, name: selectedLanguage, item: `${baseUrl}/?language=${encodeURIComponent(selectedLanguage)}` })
  }
  if (currentPage > 1) {
    breadcrumbItems.push({ '@type': 'ListItem', position: breadcrumbItems.length + 1, name: `Page ${currentPage}`, item: `${baseUrl}/?page=${currentPage}${selectedLanguage ? `&language=${encodeURIComponent(selectedLanguage)}` : ''}` })
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'Contribute to Small Projects',
        description: 'Discover small open source projects (100-600 stars) perfect for your first contributions',
        inLanguage: 'en',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'Contribute to Small Projects',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          url: `${baseUrl}/favicon.ico`
        }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbItems
      },
      {
        '@type': 'ItemList',
        itemListElement: repositories.slice(0, 10).map((repo, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'SoftwareSourceCode',
            name: `${repo.owner}/${repo.name}`,
            description: repo.description,
            url: repo.githubUrl,
            programmingLanguage: repo.language,
            codeRepository: repo.githubUrl
          }
        }))
      }
    ]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg">
        Skip to main content
      </a>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <SponsorsProvider>
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
              <SearchInput searchTerm={searchTerm} />
            </div>
            
            {/* Language Filter */}
            <div className="flex justify-center">
              <LanguageSelect languages={languages} selectedLanguage={selectedLanguage} />
            </div>
          </div>
        </header>

        {repositories.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto border border-slate-200/60">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">No repositories found</h3>
              <p className="text-slate-600 mb-2">The database might be empty.</p>
              <p className="text-slate-500 text-sm">Repositories will be automatically fetched daily via cron job.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <div className="inline-block bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-2xl px-8 py-4">
                <p className="text-slate-700 font-medium text-lg">
                  Showing <span className="font-bold text-indigo-600">{repositories.length}</span> of <span className="font-bold">{pagination.totalCount.toLocaleString()}</span> repositories 
                  {selectedLanguage && (
                    <>
                      {' '}for <span className="font-bold text-indigo-600">{selectedLanguage}</span>
                    </>
                  )}
                  {searchTerm && (
                    <>
                      {' '}matching &ldquo;<span className="font-bold text-indigo-600">{searchTerm}</span>&rdquo;
                    </>
                  )}
                </p>
                <p className="text-slate-500 text-sm mt-1">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </p>
              </div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
              {repositories.map((repo) => (
                <RepoCard key={repo.id} repository={repo} />
              ))}
            </div>

            {/* Pagination Preloader */}
            <PaginationPreloader
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              selectedLanguage={selectedLanguage}
              searchTerm={searchTerm}
            />
            
            {/* Pagination Controls */}
            <nav aria-label="Pagination" className="flex justify-center items-center gap-3 sm:gap-6 mt-12 sm:mt-16 relative">
              {pagination.hasPrevPage ? (
                <Link 
                  href={`/?page=${pagination.currentPage - 1}${selectedLanguage ? `&language=${selectedLanguage}` : ''}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`}
                  prefetch={true}
                  className="group flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-sm text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </Link>
              ) : (
                <div aria-disabled="true" className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl cursor-not-allowed font-semibold text-sm sm:text-base">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </div>
              )}

              <div className="flex items-center gap-1 sm:gap-2">
                <span aria-current="page" className="px-3 py-2 sm:px-6 sm:py-4 bg-indigo-100 text-indigo-800 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-lg border-2 border-indigo-200">
                  {pagination.currentPage}
                </span>
                <span className="text-slate-400 font-medium text-sm sm:text-base">of</span>
                <span className="px-3 py-2 sm:px-6 sm:py-4 bg-white/60 text-slate-600 rounded-xl sm:rounded-2xl font-semibold border border-slate-200 text-sm sm:text-base">
                  {pagination.totalPages}
                </span>
              </div>
              
              {pagination.hasNextPage ? (
                <Link 
                  href={`/?page=${pagination.currentPage + 1}${selectedLanguage ? `&language=${selectedLanguage}` : ''}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`}
                  prefetch={true}
                  className="group flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-sm text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div aria-disabled="true" className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-4 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl cursor-not-allowed font-semibold text-sm sm:text-base">
                  <span className="hidden sm:inline">Next</span>
                  <span className="sm:hidden">Next</span>
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </nav>
            
            {pagination.hasNextPage && (
              <div className="text-center mt-8">
                <div className="inline-block bg-slate-50/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-6 py-3">
                  <p className="text-slate-500 text-sm font-medium">
                    {(pagination.totalCount - (pagination.currentPage * pagination.limit)).toLocaleString()} more repositories available
                  </p>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Preload Indicator */}
        <PreloadIndicator />
        </main>
      </SponsorsProvider>
    </div>
  )
}
