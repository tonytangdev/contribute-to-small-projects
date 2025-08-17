import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const repositories = await prisma.repository.findMany({
      orderBy: [
        { stars: 'desc' },
        { lastUpdated: 'desc' }
      ]
    })

    return NextResponse.json(repositories)
  } catch (error) {
    console.error('Error fetching repositories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch repositories' },
      { status: 500 }
    )
  }
}