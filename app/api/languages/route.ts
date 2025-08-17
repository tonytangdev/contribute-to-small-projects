import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const languages = await prisma.repository.findMany({
      select: {
        language: true
      },
      where: {
        language: {
          not: null
        }
      },
      distinct: ['language'],
      orderBy: {
        language: 'asc'
      }
    })

    const languageList = languages
      .map(repo => repo.language)
      .filter(Boolean)
      .sort()

    const response = NextResponse.json(languageList)
    
    // Cache languages for 1 hour (3600 seconds) since they change infrequently
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    
    return response
  } catch (error) {
    console.error('Error fetching languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}