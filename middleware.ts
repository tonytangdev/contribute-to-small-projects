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
