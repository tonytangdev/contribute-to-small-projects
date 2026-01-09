import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] /api/repos request received')
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const language = searchParams.get('language')
    const search = searchParams.get('search')

    console.log('[API] Query params:', { page, limit, language, search })

    // Validate pagination parameters
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 200) // Max 200 per page

    const skip = (validPage - 1) * validLimit

    // Calculate date 1 week ago
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    console.log('[API] Date filter (1 week ago):', oneWeekAgo.toISOString())

    // Build where clause for filtering
    const whereClause: {
      language?: string;
      lastUpdated?: { gte: Date };
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      // Only show repositories updated within the last week
      lastUpdated: { gte: oneWeekAgo }
    }

    if (language) {
      whereClause.language = language
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    console.log('[API] Where clause:', JSON.stringify(whereClause, null, 2))

    // Get total count for pagination metadata
    console.log('[API] Fetching count...')
    const totalCount = await prisma.repository.count({ where: whereClause })
    console.log('[API] Total count:', totalCount)

    console.log('[API] Fetching repositories...')
    const repositories = await prisma.repository.findMany({
      where: whereClause,
      skip,
      take: validLimit,
      orderBy: [
        { lastUpdated: 'desc' },
        { stars: 'desc' }
      ]
    })
    console.log('[API] Found repositories:', repositories.length)

    const totalPages = Math.ceil(totalCount / validLimit)
    const hasNextPage = validPage < totalPages
    const hasPrevPage = validPage > 1

    const response = NextResponse.json({
      repositories,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit: validLimit,
        hasNextPage,
        hasPrevPage
      }
    })

    console.log('[API] Response ready, returning data')

    // Cache for 5 minutes (300 seconds) and allow stale content for 1 hour while revalidating
    response.headers.set('Cache-Control', 's-maxage=300, stale-while-revalidate=3600')

    return response
  } catch (error) {
    console.error('[API] ERROR fetching repositories:', error)
    console.error('[API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    })
    return NextResponse.json(
      { error: 'Failed to fetch repositories', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}