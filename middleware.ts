import { NextRequest, NextResponse } from 'next/server'
import getSession from '@util/session'

export async function middleware(
  req: NextRequest
): Promise<NextResponse | void> {
  const session = await getSession()
  const pathname = req.nextUrl.pathname
  const isAppRoute = pathname.startsWith('/chat')
  const loginRoute = pathname === '/login' || pathname === '/register'

  const isLoggedIn = !!session.account?.id

  if (isAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (loginRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/chat', req.url))
  }
}
