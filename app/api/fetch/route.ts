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

    // Create repositories in small batches to avoid statement timeout
    console.log(`Creating ${allRepositories.length} repositories in batches...`)
    
    const createBatchSize = 20 // Small batches for createMany
    let totalCreated = 0
    
    for (let i = 0; i < allRepositories.length; i += createBatchSize) {
      const batch = allRepositories.slice(i, i + createBatchSize)
      
      const result = await prisma.repository.createMany({
        data: batch.map(repo => ({
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
      
      totalCreated += result.count
      console.log(`Batch ${Math.floor(i / createBatchSize) + 1}/${Math.ceil(allRepositories.length / createBatchSize)}: created ${result.count} new repositories`)
    }
    
    const actualNewCount = totalCreated
    console.log(`Total: created ${actualNewCount} new repositories, skipped ${allRepositories.length - actualNewCount} existing ones`)
    
    // Then update existing repositories in small batches to avoid connection issues
    if (existingRepositories.length > 0) {
      console.log(`Updating ${existingRepositories.length} existing repositories in batches...`)
      
      const batchSize = 5 // Small batches to stay under connection limit
      
      for (let i = 0; i < existingRepositories.length; i += batchSize) {
        const batch = existingRepositories.slice(i, i + batchSize)
        
        const updatePromises = batch.map(repo =>
          prisma.repository.updateMany({
            where: { githubUrl: repo.githubUrl },
            data: {
              description: repo.description,
              language: repo.language,
              stars: repo.stars,
              lastUpdated: repo.lastUpdated,
            },
          })
        )
        
        await Promise.all(updatePromises)
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(existingRepositories.length / batchSize)}`)
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