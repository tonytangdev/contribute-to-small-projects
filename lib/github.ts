interface GitHubRepository {
  id: number
  name: string
  full_name: string
  description: string | null
  language: string | null
  stargazers_count: number
  html_url: string
  updated_at: string
  owner: {
    login: string
  }
}

interface GitHubSearchResponse {
  items: GitHubRepository[]
  total_count: number
}

export interface Repository {
  name: string
  owner: string
  description: string | null
  language: string | null
  stars: number
  contributors: number | null
  githubUrl: string
  lastUpdated: Date
}

export class GitHubClient {
  private token: string
  private baseUrl = 'https://api.github.com'

  constructor(token: string) {
    this.token = token
  }

  async searchRepositories(minStars = 100, maxStars = 600, page = 1): Promise<Repository[]> {
    try {
      const query = `stars:${minStars}..${maxStars} is:public`
      const params = new URLSearchParams({
        q: query,
        sort: 'updated',
        order: 'desc',
        per_page: '100',
        page: page.toString()
      })

      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'contribute-to-small-projects'
      }

      // Only add Authorization header if token is provided and not a placeholder
      if (this.token && this.token !== 'your_github_token_here') {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.baseUrl}/search/repositories?${params}`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const data: GitHubSearchResponse = await response.json()
      
      // Fetch contributors count for each repository
      const repositories = await Promise.all(
        data.items.map(async (repo) => {
          let contributors = null
          try {
            const contributorsResponse = await fetch(`${this.baseUrl}/repos/${repo.full_name}/contributors?per_page=1`, {
              headers
            })
            
            if (contributorsResponse.ok) {
              const linkHeader = contributorsResponse.headers.get('link')
              if (linkHeader) {
                // Parse the last page from Link header to get total count
                const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
                contributors = lastPageMatch ? parseInt(lastPageMatch[1]) : 1
              } else {
                // If no Link header, check if we got any contributors
                const contributorsData = await contributorsResponse.json()
                contributors = contributorsData.length
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch contributors for ${repo.full_name}:`, error)
          }

          return {
            name: repo.name,
            owner: repo.owner.login,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            contributors,
            githubUrl: repo.html_url,
            lastUpdated: new Date(repo.updated_at)
          }
        })
      )
      
      return repositories
    } catch (error) {
      console.error('Error fetching repositories from GitHub:', error)
      throw error
    }
  }
}