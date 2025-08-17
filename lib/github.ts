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

  async searchRepositories(minStars = 100, maxStars = 600, page = 1, sortBy: 'updated' | 'stars' | 'forks' = 'updated'): Promise<Repository[]> {
    try {
      const query = `stars:${minStars}..${maxStars} is:public`
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
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
        console.log('Using GitHub API authentication')
      } else {
        console.log('No GitHub API token provided - using unauthenticated requests')
      }

      const response = await fetch(`${this.baseUrl}/search/repositories?${params}`, {
        headers
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const data: GitHubSearchResponse = await response.json()
      
      // Convert GitHub repositories to our Repository format (without contributors for now)
      const repositories = data.items.map((repo) => ({
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        contributors: null, // Will be fetched separately for new repos only
        githubUrl: repo.html_url,
        lastUpdated: new Date(repo.updated_at)
      }))
      
      return repositories
    } catch (error) {
      console.error('Error fetching repositories from GitHub:', error)
      throw error
    }
  }

  async fetchContributorsCount(fullName: string): Promise<number | null> {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'contribute-to-small-projects'
      }

      if (this.token && this.token !== 'your_github_token_here') {
        headers['Authorization'] = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.baseUrl}/repos/${fullName}/contributors?per_page=1`, {
        headers
      })
      
      if (!response.ok) {
        console.warn(`Failed to fetch contributors for ${fullName}: ${response.status}`)
        return null
      }

      const linkHeader = response.headers.get('link')
      if (linkHeader) {
        // Parse the last page from Link header to get total count
        const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/)
        return lastPageMatch ? parseInt(lastPageMatch[1]) : 1
      } else {
        // If no Link header, check if we got any contributors
        const contributorsData = await response.json()
        return contributorsData.length
      }
    } catch (error) {
      console.warn(`Failed to fetch contributors for ${fullName}:`, error)
      return null
    }
  }
}