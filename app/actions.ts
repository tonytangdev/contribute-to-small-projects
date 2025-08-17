'use server'

import { redirect } from 'next/navigation'

export async function filterByLanguage(formData: FormData) {
  const language = formData.get('language') as string
  const params = new URLSearchParams()
  
  if (language) {
    params.set('language', language)
  }
  
  redirect(`/?${params.toString()}`)
}

export async function searchRepositories(formData: FormData) {
  const search = formData.get('search') as string
  const params = new URLSearchParams()
  
  if (search && search.trim()) {
    params.set('search', search.trim())
  }
  
  redirect(`/?${params.toString()}`)
}