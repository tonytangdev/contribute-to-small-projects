'use server'

import { prisma } from '@/lib/db'

interface Repository {
  id: string
  name: string
  owner: string
  description: string | null
  language: string | null
  stars: number
  contributors: number | null
  githubUrl: string
  lastUpdated: string
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface RepositoryResponse {
  repositories: Repository[]
  pagination: PaginationInfo
}

export async function getRepositories(
  page = 1,
  language?: string,
  search?: string
): Promise<RepositoryResponse> {
  try {
    const limit = 25
    const validPage = Math.max(1, page)
    const skip = (validPage - 1) * limit

    // Calculate date 1 week ago
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // Build where clause for filtering
    const whereClause: {
      language?: string;
      lastUpdated?: { gte: Date };
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        description?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
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

    // Get total count
    const totalCount = await prisma.repository.count({ where: whereClause })

    // Get repositories
    const repositories = await prisma.repository.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { lastUpdated: 'desc' },
        { stars: 'desc' }
      ]
    })

    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = validPage < totalPages
    const hasPrevPage = validPage > 1

    // Transform repositories to match the interface (convert Date to string)
    const transformedRepositories: Repository[] = repositories.map(repo => ({
      ...repo,
      lastUpdated: repo.lastUpdated.toISOString()
    }))

    return {
      repositories: transformedRepositories,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalCount,
        limit,
        hasNextPage,
        hasPrevPage
      }
    }
  } catch (error) {
    console.error('[ServerAction] Error fetching repositories:', error)
    return {
      repositories: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalCount: 0,
        limit: 25,
        hasNextPage: false,
        hasPrevPage: false
      }
    }
  }
}

export async function getLanguages(): Promise<string[]> {
  try {
    const result = await prisma.repository.findMany({
      select: { language: true },
      where: { language: { not: null } },
      distinct: ['language'],
      orderBy: { language: 'asc' }
    })

    return result.map(r => r.language).filter((lang): lang is string => lang !== null)
  } catch (error) {
    console.error('[ServerAction] Error fetching languages:', error)
    return []
  }
}
