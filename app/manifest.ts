import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Contribute to Small Projects',
    short_name: 'Small Projects',
    description: 'Discover small open source projects (100-600 stars) perfect for your first contributions',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#4338ca',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
