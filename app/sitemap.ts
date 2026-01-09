import { MetadataRoute } from 'next'
import { getLanguages, getRepositories } from '@/app/repo-actions'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.contribute-to-small-projects.com'

  // Fetch languages using server action
  const languages = await getLanguages()

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]

  // Get total pages for home (sample with first page)
  const homeData = await getRepositories(1)
  const totalPages = Math.min(homeData.pagination.totalPages, 10) // Limit to first 10 pages

  // Add paginated home pages
  for (let page = 2; page <= totalPages; page++) {
    routes.push({
      url: `${baseUrl}/page/${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    })
  }

  // Add top language pages (limit to top 20)
  const topLanguages = languages.slice(0, 20)
  for (const language of topLanguages) {
    routes.push({
      url: `${baseUrl}/${encodeURIComponent(language)}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })

    // Add page 2 for each language
    routes.push({
      url: `${baseUrl}/${encodeURIComponent(language)}/page/2`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.5,
    })
  }

  return routes
}
