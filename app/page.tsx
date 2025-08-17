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

async function getRepositories(): Promise<Repository[]> {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/repos`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return []
  }
}

export default async function Home() {
  const repositories = await getRepositories()

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
                Showing {repositories.length} repositories
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {repositories.map((repo) => (
                <RepoCard key={repo.id} repository={repo} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
