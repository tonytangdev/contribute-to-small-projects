import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.contribute-to-small-projects.com'

  // Fetch languages for the sitemap
  let languages: string[] = []
  try {
    const response = await fetch(`${baseUrl}/api/languages`, {
      next: { revalidate: 3600 }
    })
    if (response.ok) {
      languages = await response.json()
    }
  } catch (error) {
    console.error('Error fetching languages for sitemap:', error)
  }

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]

  // Add top language filter pages (limit to top 20 most common)
  const topLanguages = languages.slice(0, 20)
  for (const language of topLanguages) {
    routes.push({
      url: `${baseUrl}/?language=${encodeURIComponent(language)}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    })
  }

  return routes
}
