'use client'

import { searchRepositories } from '@/app/actions'
import { useRef } from 'react'
import { useFormStatus } from 'react-dom'

interface SearchInputProps {
  searchTerm?: string
}

function SearchButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Searching...
        </div>
      ) : (
        'Search'
      )}
    </button>
  )
}

export default function SearchInput({ searchTerm }: SearchInputProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={searchRepositories} className="flex items-center gap-4 w-full max-w-md">
      <div className="relative flex-1">
        <input
          type="text"
          name="search"
          placeholder="Search repositories..."
          defaultValue={searchTerm || ''}
          className="w-full appearance-none bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl px-6 py-3 pl-12 text-slate-700 font-medium shadow-sm hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-200"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      <SearchButton />
    </form>
  )
}