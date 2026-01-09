'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

async function getCurrentParams() {
  const headersList = await headers()
  const referer = headersList.get('referer')
  if (referer) {
    const url = new URL(referer)
    return new URLSearchParams(url.search)
  }
  return new URLSearchParams()
}

export async function filterByLanguage(formData: FormData) {
  const language = formData.get('language') as string
  const params = await getCurrentParams()

  // Reset to page 1 when changing filter
  params.delete('page')
  params.delete('language')

  if (language) {
    redirect(`/${language}${params.toString() ? `?${params.toString()}` : ''}`)
  } else {
    redirect(`/${params.toString() ? `?${params.toString()}` : ''}`)
  }
}

export async function searchRepositories(formData: FormData) {
  const search = formData.get('search') as string
  const headersList = await headers()
  const referer = headersList.get('referer')

  // Reset to page 1 when changing search
  const params = new URLSearchParams()
  if (search && search.trim()) {
    params.set('search', search.trim())
  }

  // Preserve current language from path
  if (referer) {
    const url = new URL(referer)
    const pathParts = url.pathname.split('/').filter(Boolean)
    if (pathParts.length > 0 && pathParts[0] !== 'page') {
      // First path segment is language
      redirect(`/${pathParts[0]}${params.toString() ? `?${params.toString()}` : ''}`)
      return
    }
  }

  redirect(`/${params.toString() ? `?${params.toString()}` : ''}`)
}