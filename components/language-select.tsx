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
    <form ref={formRef} action={filterByLanguage} className="flex items-center gap-6">
      <label htmlFor="language-filter" className="text-slate-700 font-semibold text-lg">
        Filter by language:
      </label>
      <div className="relative">
        <select 
          name="language"
          id="language-filter"
          className="appearance-none bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl px-6 py-3 pr-12 text-slate-700 font-medium shadow-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200 cursor-pointer"
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
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </form>
  )
}