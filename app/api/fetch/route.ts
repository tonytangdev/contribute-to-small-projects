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
    
    // Fetch multiple pages in parallel to get more diverse repositories
    const pagesToFetch = 5 // Fetch 5 pages = 500 repositories max
    const pagePromises = []
    
    console.log(`Fetching ${pagesToFetch} pages in parallel...`)
    for (let page = 1; page <= pagesToFetch; page++) {
      pagePromises.push(githubClient.searchRepositories(100, 600, page))
    }
    
    const pageResults = await Promise.all(pagePromises)
    const allRepositories: Repository[] = []
    
    for (let i = 0; i < pageResults.length; i++) {
      const repositories = pageResults[i]
      console.log(`Page ${i + 1}: fetched ${repositories.length} repositories`)
      allRepositories.push(...repositories)
      
      // If we get less than 100 repos, we've reached the end of available results
      if (repositories.length < 100) {
        console.log(`Reached end of results at page ${i + 1}`)
      }
    }
    
    console.log(`Fetched ${allRepositories.length} repositories from GitHub across ${Math.min(pagesToFetch, Math.ceil(allRepositories.length / 100))} pages`)

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
    const upsertedCount = allRepositories.length

    console.log(`Successfully upserted ${upsertedCount} repositories`)

    return NextResponse.json({
      success: true,
      message: `Successfully fetched and stored ${upsertedCount} repositories`,
      count: upsertedCount
    })

  } catch (error) {
    console.error('Error in fetch endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}