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
  githubUrl: string
  lastUpdated: Date
}

export class GitHubClient {
  private token: string
  private baseUrl = 'https://api.github.com'

  constructor(token: string) {
    this.token = token
  }

  async searchRepositories(minStars = 100, maxStars = 600): Promise<Repository[]> {
    try {
      const query = `stars:${minStars}..${maxStars} is:public`
      const params = new URLSearchParams({
        q: query,
        sort: 'updated',
        order: 'desc',
        per_page: '100'
      })

      const response = await fetch(`${this.baseUrl}/search/repositories?${params}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'contribute-to-small-projects'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const data: GitHubSearchResponse = await response.json()
      
      return data.items.map(repo => ({
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        githubUrl: repo.html_url,
        lastUpdated: new Date(repo.updated_at)
      }))
    } catch (error) {
      console.error('Error fetching repositories from GitHub:', error)
      throw error
    }
  }
}