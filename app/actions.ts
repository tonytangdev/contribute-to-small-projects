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