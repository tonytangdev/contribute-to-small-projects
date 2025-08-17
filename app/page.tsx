import Link from 'next/link'
import RepoCard from '@/components/repo-card'

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

async function getRepositories(page = 1): Promise<RepositoryResponse> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/repos?page=${page}&limit=25`, {
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

interface HomeProps {
  searchParams: { page?: string }
}

export default async function Home({ searchParams }: HomeProps) {
  const currentPage = parseInt(searchParams.page || '1', 10)
  const data = await getRepositories(currentPage)
  const { repositories, pagination } = data

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Contribute to Small Projects
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover open source projects with 100-600 stars - perfect for your first contributions
          </p>
        </header>

        {repositories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No repositories found. The database might be empty.
            </p>
            <p className="text-gray-500 text-sm">
              Repositories will be automatically fetched daily via cron job.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-gray-600">
                Showing {repositories.length} of {pagination.totalCount} repositories (Page {pagination.currentPage} of {pagination.totalPages})
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {repositories.map((repo) => (
                <RepoCard key={repo.id} repository={repo} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-4 mt-12">
              {pagination.hasPrevPage ? (
                <Link 
                  href={`/?page=${pagination.currentPage - 1}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← Previous
                </Link>
              ) : (
                <div className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                  ← Previous
                </div>
              )}
              
              <span className="px-4 py-2 text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              {pagination.hasNextPage ? (
                <Link 
                  href={`/?page=${pagination.currentPage + 1}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <div className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
                  Next →
                </div>
              )}
            </div>
            
            <div className="text-center mt-4">
              <p className="text-gray-500 text-sm">
                {pagination.hasNextPage && `${pagination.totalCount - (pagination.currentPage * pagination.limit)} more repositories available`}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
