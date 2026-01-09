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

  if (language) {
    params.set('language', language)
  } else {
    params.delete('language')
  }

  redirect(`/?${params.toString()}`)
}

export async function searchRepositories(formData: FormData) {
  const search = formData.get('search') as string
  const params = await getCurrentParams()

  // Reset to page 1 when changing search
  params.delete('page')

  if (search && search.trim()) {
    params.set('search', search.trim())
  } else {
    params.delete('search')
  }

  redirect(`/?${params.toString()}`)
}