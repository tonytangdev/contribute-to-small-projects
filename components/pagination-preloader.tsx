'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface PaginationPreloaderProps {
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  selectedLanguage?: string
  searchTerm?: string
}

export default function PaginationPreloader({
  currentPage,
  totalPages,
  hasNextPage,
  selectedLanguage,
  searchTerm
}: PaginationPreloaderProps) {
  const router = useRouter()
  const observerRef = useRef<HTMLDivElement>(null)
  const preloadedPages = useRef<Set<number>>(new Set())

  const preloadNextPage = useCallback(async (pageNum: number) => {
    if (preloadedPages.current.has(pageNum)) return
    
    try {
      preloadedPages.current.add(pageNum)
      
      // Dispatch preload start event
      window.dispatchEvent(new CustomEvent('preload-start'))
      
      // Build URL for API call
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: '25'
      })
      
      if (selectedLanguage) {
        params.set('language', selectedLanguage)
      }
      
      if (searchTerm) {
        params.set('search', searchTerm)
      }
      
      // Preload the API data
      const response = await fetch(`/api/repos?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        // Store in cache for faster access
        await response.json()
        
        // Also prefetch the Next.js page
        const pageUrl = `/?page=${pageNum}${selectedLanguage ? `&language=${selectedLanguage}` : ''}${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ''}`
        router.prefetch(pageUrl)
        
        console.log(`✅ Preloaded page ${pageNum}`)
        
        // Dispatch preload end event
        window.dispatchEvent(new CustomEvent('preload-end'))
      }
    } catch (error) {
      console.log(`❌ Failed to preload page ${pageNum}:`, error)
      preloadedPages.current.delete(pageNum)
      
      // Dispatch preload end event even on error
      window.dispatchEvent(new CustomEvent('preload-end'))
    }
  }, [selectedLanguage, searchTerm, router])

  useEffect(() => {
    const currentObserverRef = observerRef.current
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Preload next page when pagination comes into view
            if (hasNextPage) {
              const nextPage = currentPage + 1
              preloadNextPage(nextPage)
            }
            
            // Also preload a few pages ahead for smoother navigation
            for (let i = 1; i <= 2; i++) {
              const futurePageNum = currentPage + i
              if (futurePageNum <= totalPages && !preloadedPages.current.has(futurePageNum)) {
                preloadNextPage(futurePageNum)
              }
            }
          }
        })
      },
      {
        rootMargin: '100px', // Start preloading 100px before pagination comes into view
        threshold: 0.1
      }
    )

    if (currentObserverRef) {
      observer.observe(currentObserverRef)
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef)
      }
    }
  }, [currentPage, totalPages, hasNextPage, selectedLanguage, searchTerm, preloadNextPage])

  return (
    <div ref={observerRef} className="absolute bottom-0 left-0 w-1 h-1 opacity-0 pointer-events-none" />
  )
}