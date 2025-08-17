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

    return NextResponse.json(languageList)
  } catch (error) {
    console.error('Error fetching languages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch languages' },
      { status: 500 }
    )
  }
}