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
    const repositories = await githubClient.searchRepositories()
    console.log(`Fetched ${repositories.length} repositories from GitHub`)

    let upsertedCount = 0
    for (const repo of repositories) {
      await prisma.repository.upsert({
        where: { githubUrl: repo.githubUrl },
        update: {
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
          lastUpdated: repo.lastUpdated,
        },
        create: {
          name: repo.name,
          owner: repo.owner,
          description: repo.description,
          language: repo.language,
          stars: repo.stars,
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