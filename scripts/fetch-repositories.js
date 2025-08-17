#!/usr/bin/env node

/**
 * Standalone repository fetcher script for VPS deployment
 * Fetches GitHub repositories and stores them in PostgreSQL database
 */

const { PrismaClient } = require('@prisma/client')

// GitHub API client
class GitHubClient {
  constructor(token) {
    this.token = token
    this.baseUrl = 'https://api.github.com'
  }

  async searchRepositories(minStars = 100, maxStars = 600, page = 1, sortBy = 'updated') {
    try {
      const query = `stars:${minStars}..${maxStars} is:public`
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        order: 'desc',
        per_page: '100',
        page: page.toString()
      })

      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'contribute-to-small-projects'
      }

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

      const data = await response.json()
      
      // Convert GitHub repositories to our Repository format
      const repositories = data.items.map((repo) => ({
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        contributors: null,
        githubUrl: repo.html_url,
        lastUpdated: new Date(repo.updated_at)
      }))
      
      return repositories
    } catch (error) {
      console.error('Error fetching repositories from GitHub:', error)
      throw error
    }
  }
}

async function main() {
  console.log('=== Repository Fetch Script Started ===')
  console.log(`Started at: ${new Date().toISOString()}`)

  // Initialize Prisma client
  const prisma = new PrismaClient()

  try {
    // Check required environment variables
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable is not set')
      process.exit(1)
    }

    const githubClient = new GitHubClient(githubToken)
    
    console.log('Starting GitHub repository fetch...')
    
    // Use search strategies to get diverse repositories
    const searchStrategies = [
      { minStars: 100, maxStars: 300, sortBy: 'updated' },
      { minStars: 300, maxStars: 600, sortBy: 'stars' }
    ]
    
    console.log(`Fetching repositories using ${searchStrategies.length} different strategies...`)
    const pagePromises = searchStrategies.map((strategy, index) => {
      console.log(`Strategy ${index + 1}: ${strategy.minStars}-${strategy.maxStars} stars, sorted by ${strategy.sortBy}`)
      return githubClient.searchRepositories(strategy.minStars, strategy.maxStars, 1, strategy.sortBy)
    })
    
    const pageResults = await Promise.all(pagePromises)
    const allRepositories = []
    
    for (let i = 0; i < pageResults.length; i++) {
      const repositories = pageResults[i]
      const strategy = searchStrategies[i]
      console.log(`Strategy ${i + 1} (${strategy.minStars}-${strategy.maxStars} stars, ${strategy.sortBy}): fetched ${repositories.length} repositories`)
      allRepositories.push(...repositories)
    }
    
    console.log(`Fetched ${allRepositories.length} repositories from GitHub using ${searchStrategies.length} different strategies`)

    // Check which repositories already exist in our database
    const existingRepos = await prisma.repository.findMany({
      where: {
        githubUrl: {
          in: allRepositories.map(repo => repo.githubUrl)
        }
      },
      select: {
        githubUrl: true
      }
    })
    
    const existingUrls = new Set(existingRepos.map(repo => repo.githubUrl))
    const newRepositories = allRepositories.filter(repo => !existingUrls.has(repo.githubUrl))
    const existingRepositories = allRepositories.filter(repo => existingUrls.has(repo.githubUrl))
    
    console.log(`Found ${newRepositories.length} new repositories and ${existingRepositories.length} existing repositories`)
    
    // Create new repositories sequentially
    let actualNewCount = 0
    
    if (newRepositories.length > 0) {
      console.log(`Creating ${newRepositories.length} new repositories sequentially...`)
      
      for (let i = 0; i < newRepositories.length; i++) {
        const repo = newRepositories[i]
        try {
          await prisma.repository.create({
            data: {
              name: repo.name,
              owner: repo.owner,
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
              contributors: null,
              githubUrl: repo.githubUrl,
              lastUpdated: repo.lastUpdated,
            },
          })
          actualNewCount++
          
          if ((i + 1) % 10 === 0) {
            console.log(`Created ${i + 1}/${newRepositories.length} new repositories`)
          }
        } catch (error) {
          if (error.code === 'P2002') {
            console.log(`Skipped duplicate repository: ${repo.githubUrl}`)
          } else {
            console.error(`Failed to create repository ${repo.githubUrl}:`, error)
          }
        }
      }
      
      console.log(`Created ${actualNewCount} new repositories`)
    } else {
      console.log(`No new repositories to create`)
    }
    
    // Update existing repositories sequentially
    if (existingRepositories.length > 0) {
      console.log(`Updating ${existingRepositories.length} existing repositories sequentially...`)
      
      for (let i = 0; i < existingRepositories.length; i++) {
        const repo = existingRepositories[i]
        try {
          await prisma.repository.updateMany({
            where: { githubUrl: repo.githubUrl },
            data: {
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
              lastUpdated: repo.lastUpdated,
            },
          })
          
          if ((i + 1) % 10 === 0) {
            console.log(`Updated ${i + 1}/${existingRepositories.length} existing repositories`)
          }
        } catch (error) {
          console.error(`Failed to update repository ${repo.githubUrl}:`, error)
        }
      }
      
      console.log(`Updated ${existingRepositories.length} existing repositories`)
    }

    console.log(`\n=== Summary ===`)
    console.log(`Total repositories processed: ${allRepositories.length}`)
    console.log(`New repositories created: ${actualNewCount}`)
    console.log(`Existing repositories updated: ${existingRepositories.length}`)
    console.log(`Completed at: ${new Date().toISOString()}`)

  } catch (error) {
    console.error('Error in repository fetch:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()