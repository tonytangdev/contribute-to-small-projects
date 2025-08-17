'use client'

import { filterByLanguage } from '@/app/actions'
import { useRef } from 'react'

interface LanguageSelectProps {
  languages: string[]
  selectedLanguage?: string
}

export default function LanguageSelect({ languages, selectedLanguage }: LanguageSelectProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={filterByLanguage} className="flex items-center gap-4">
      <label htmlFor="language-filter" className="text-gray-700 font-medium">
        Filter by language:
      </label>
      <select 
        name="language"
        id="language-filter"
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        defaultValue={selectedLanguage || ''}
        onChange={() => formRef.current?.requestSubmit()}
      >
        <option value="">All Languages</option>
        {languages.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
    </form>
  )
}