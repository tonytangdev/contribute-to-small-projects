import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl

  // Redirect old /?language=X format to /X
  if (pathname === '/' && searchParams.has('language')) {
    const language = searchParams.get('language')
    if (language) {
      const newUrl = new URL(`/${language}`, request.url)

      // Preserve other params (page, search)
      searchParams.delete('language')
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value)
      })

      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }

  // Redirect old /?page=X to /page/X (for pages > 1)
  if (pathname === '/' && searchParams.has('page')) {
    const page = searchParams.get('page')
    const pageNum = parseInt(page || '0', 10)

    if (pageNum > 1) {
      const newUrl = new URL(`/page/${pageNum}`, request.url)
      searchParams.delete('page')
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value)
      })
      return NextResponse.redirect(newUrl, { status: 301 })
    }

    // page=1 -> redirect to / (remove param)
    if (pageNum === 1) {
      const newUrl = new URL('/', request.url)
      searchParams.delete('page')
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value)
      })
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }

  // Redirect /page/1 to /
  if (pathname === '/page/1') {
    const newUrl = new URL('/', request.url)
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  // Redirect /[language]?page=X to /[language]/page/X
  const languagePageMatch = pathname.match(/^\/([^/]+)$/)
  if (languagePageMatch && pathname !== '/' && !pathname.startsWith('/page/') && searchParams.has('page')) {
    const language = languagePageMatch[1]
    const page = searchParams.get('page')
    const pageNum = parseInt(page || '0', 10)

    if (pageNum > 1) {
      const newUrl = new URL(`/${language}/page/${pageNum}`, request.url)
      searchParams.delete('page')
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value)
      })
      return NextResponse.redirect(newUrl, { status: 301 })
    }

    // page=1 -> redirect to /[language]
    if (pageNum === 1) {
      const newUrl = new URL(`/${language}`, request.url)
      searchParams.delete('page')
      searchParams.forEach((value, key) => {
        newUrl.searchParams.set(key, value)
      })
      return NextResponse.redirect(newUrl, { status: 301 })
    }
  }

  // Redirect /[language]/page/1 to /[language]
  const languagePage1Match = pathname.match(/^\/([^/]+)\/page\/1$/)
  if (languagePage1Match) {
    const language = languagePage1Match[1]
    const newUrl = new URL(`/${language}`, request.url)
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value)
    })
    return NextResponse.redirect(newUrl, { status: 301 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
