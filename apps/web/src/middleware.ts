import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/listings/create') ||
    pathname.startsWith('/offers') ||
    pathname.startsWith('/settings')
  ) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/messages/:path*',
    '/listings/create',
    '/offers/:path*',
    '/settings/:path*',
  ],
}
