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
    
    // Use fewer search strategies to reduce load and stay within timeout limits
    const searchStrategies = [
      { minStars: 100, maxStars: 300, sortBy: 'updated' as const },
      { minStars: 300, maxStars: 600, sortBy: 'stars' as const }
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
    
    // Skip fetching contributors to reduce API load and processing time
    console.log(`Skipping contributor fetch to optimize performance`)

    // First, bulk create all repositories (new ones created, existing ones skipped)
    console.log(`Bulk creating ${allRepositories.length} repositories...`)
    
    const result = await prisma.repository.createMany({
      data: allRepositories.map(repo => ({
        name: repo.name,
        owner: repo.owner,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        contributors: null,
        githubUrl: repo.githubUrl,
        lastUpdated: repo.lastUpdated,
      })),
      skipDuplicates: true,
    })
    
    const actualNewCount = result.count
    console.log(`Created ${actualNewCount} new repositories, skipped ${allRepositories.length - actualNewCount} existing ones`)
    
    // Then update existing repositories to keep data current
    if (existingRepositories.length > 0) {
      console.log(`Updating ${existingRepositories.length} existing repositories...`)
      
      for (const repo of existingRepositories) {
        await prisma.repository.updateMany({
          where: { githubUrl: repo.githubUrl },
          data: {
            description: repo.description,
            language: repo.language,
            stars: repo.stars,
            lastUpdated: repo.lastUpdated,
          },
        })
      }
      
      console.log(`Updated ${existingRepositories.length} existing repositories`)
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${allRepositories.length} repositories (${actualNewCount} new, ${existingRepositories.length} updated)`,
      totalFetched: allRepositories.length,
      newRepositories: actualNewCount,
      updatedRepositories: existingRepositories.length
    })

  } catch (error) {
    console.error('Error in fetch endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}