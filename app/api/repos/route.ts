import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '25', 10)
    const language = searchParams.get('language')
    
    // Validate pagination parameters
    const validPage = Math.max(1, page)
    const validLimit = Math.min(Math.max(1, limit), 200) // Max 200 per page
    
    const skip = (validPage - 1) * validLimit

    // Build where clause for filtering
    const whereClause = language ? { language } : {}

    // Get total count for pagination metadata
    const totalCount = await prisma.repository.count({ where: whereClause })
    
    const repositories = await prisma.repository.findMany({
      where: whereClause,
      skip,
      take: validLimit,
      orderBy: [
        { lastUpdated: 'desc' },
        { stars: 'desc' }
      ]
    })

    const totalPages = Math.ceil(totalCount / validLimit)
    const hasNextPage = validPage < totalPages
    const hasPrevPage = validPage > 1

    return NextResponse.json({
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
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}