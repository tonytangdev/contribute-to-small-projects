import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GitHubClient, Repository } from '@/lib/github'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret) {
      console.error('CRON_SECRET environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized fetch attempt')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      console.error('GITHUB_TOKEN environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const githubClient = new GitHubClient(githubToken)
    
    console.log('Starting GitHub repository fetch...')
    
    // Use different search strategies to get more diverse repositories
    const searchStrategies = [
      { minStars: 100, maxStars: 200, sortBy: 'updated' as const },
      { minStars: 200, maxStars: 300, sortBy: 'stars' as const },
      { minStars: 300, maxStars: 400, sortBy: 'forks' as const },
      { minStars: 400, maxStars: 500, sortBy: 'updated' as const },
      { minStars: 500, maxStars: 600, sortBy: 'stars' as const }
    ]
    
    console.log(`Fetching repositories using ${searchStrategies.length} different strategies...`)
    const pagePromises = searchStrategies.map((strategy, index) => {
      console.log(`Strategy ${index + 1}: ${strategy.minStars}-${strategy.maxStars} stars, sorted by ${strategy.sortBy}`)
      return githubClient.searchRepositories(strategy.minStars, strategy.maxStars, 1, strategy.sortBy)
    })
    
    const pageResults = await Promise.all(pagePromises)
    const allRepositories: Repository[] = []
    
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
    
    // Fetch contributors only for new repositories
    if (newRepositories.length > 0) {
      console.log(`Fetching contributors for ${newRepositories.length} new repositories...`)
      const contributorPromises = newRepositories.map(async (repo) => {
        const contributors = await githubClient.fetchContributorsCount(`${repo.owner}/${repo.name}`)
        return { ...repo, contributors }
      })
      
      const newReposWithContributors = await Promise.all(contributorPromises)
      
      // Replace the new repositories with the ones that have contributor counts
      newReposWithContributors.forEach((repoWithContributors, index) => {
        const originalIndex = allRepositories.findIndex(r => r.githubUrl === repoWithContributors.githubUrl)
        if (originalIndex !== -1) {
          allRepositories[originalIndex] = repoWithContributors
        }
      })
    }

    // Use parallel database operations for better performance
    console.log(`Upserting ${allRepositories.length} repositories in parallel...`)
    const upsertPromises = allRepositories.map(repo => 
      prisma.repository.upsert({
        where: { githubUrl: repo.githubUrl },
        update: {
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          contributors: repo.contributors,
          lastUpdated: repo.lastUpdated,
        },
        create: {
          name: repo.name,
          owner: repo.owner,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          contributors: repo.contributors,
          githubUrl: repo.githubUrl,
          lastUpdated: repo.lastUpdated,
        },
      })
    )
    
    await Promise.all(upsertPromises)
    const totalProcessed = allRepositories.length
    const newlyAdded = newRepositories.length

    console.log(`Successfully upserted ${totalProcessed} repositories (${newlyAdded} new, ${totalProcessed - newlyAdded} updated)`)

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and stored ${totalProcessed} repositories (${newlyAdded} new, ${totalProcessed - newlyAdded} updated)`,
      count: totalProcessed,
      newRepositories: newlyAdded,
      updatedRepositories: totalProcessed - newlyAdded
    })

  } catch (error) {
    console.error('Error in fetch endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}