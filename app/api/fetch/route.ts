import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { GitHubClient } from '@/lib/github'

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
    
    // Fetch multiple pages to get more diverse repositories
    const allRepositories: any[] = []
    const pagesToFetch = 5 // Fetch 5 pages = 500 repositories max
    
    for (let page = 1; page <= pagesToFetch; page++) {
      console.log(`Fetching page ${page}...`)
      const repositories = await githubClient.searchRepositories(100, 600, page)
      allRepositories.push(...repositories)
      
      // If we get less than 100 repos, we've reached the end
      if (repositories.length < 100) {
        console.log(`Reached end of results at page ${page}`)
        break
      }
    }
    
    console.log(`Fetched ${allRepositories.length} repositories from GitHub across ${Math.min(pagesToFetch, Math.ceil(allRepositories.length / 100))} pages`)

    let upsertedCount = 0
    for (const repo of allRepositories) {
      await prisma.repository.upsert({
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
      upsertedCount++
    }

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