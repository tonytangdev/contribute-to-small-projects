import Link from 'next/link'
import RepoCard from '@/components/repo-card'
import LanguageSelect from '@/components/language-select'

interface Repository {
  id: string
  name: string
  owner: string
  description: string | null
  language: string | null
  stars: number
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

async function getRepositories(page = 1, language?: string): Promise<RepositoryResponse> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '25'
    })
    
    if (language) {
      params.set('language', language)
    }
    
    const response = await fetch(`${baseUrl}/api/repos?${params}`, {
      cache: 'no-store'
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
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/languages`, {
      cache: 'no-store'
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
  searchParams: { page?: string, language?: string }
}

export default async function Home({ searchParams }: HomeProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const selectedLanguage = searchParams.language
  const data = await getRepositories(currentPage, selectedLanguage)
  const languages = await getLanguages()
  const { repositories, pagination } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <header className="text-center mb-16">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight">
              Contribute to Small Projects
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Discover open source projects with 100-600 stars — perfect for your first contributions
            </p>
            
            {/* Language Filter */}
            <div className="flex justify-center pt-4">
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

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-6 mt-16">
              {pagination.hasPrevPage ? (
                <Link 
                  href={`/?page=${pagination.currentPage - 1}${selectedLanguage ? `&language=${selectedLanguage}` : ''}`}
                  className="group flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-sm"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl cursor-not-allowed font-semibold">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <span className="px-6 py-4 bg-indigo-100 text-indigo-800 rounded-2xl font-bold text-lg border-2 border-indigo-200">
                  {pagination.currentPage}
                </span>
                <span className="text-slate-400 font-medium">of</span>
                <span className="px-6 py-4 bg-white/60 text-slate-600 rounded-2xl font-semibold border border-slate-200">
                  {pagination.totalPages}
                </span>
              </div>
              
              {pagination.hasNextPage ? (
                <Link 
                  href={`/?page=${pagination.currentPage + 1}${selectedLanguage ? `&language=${selectedLanguage}` : ''}`}
                  className="group flex items-center gap-3 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-slate-200 text-slate-700 rounded-2xl hover:bg-indigo-50 hover:border-indigo-300 hover:-translate-y-0.5 transition-all duration-200 font-semibold shadow-sm"
                >
                  Next
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <div className="flex items-center gap-3 px-8 py-4 bg-slate-100 text-slate-400 rounded-2xl cursor-not-allowed font-semibold">
                  Next
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
            
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
      </div>
    </div>
  )
}
