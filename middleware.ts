import { NextRequest, NextResponse } from 'next/server'
import getSession from '@util/session'

export async function middleware(
  req: NextRequest
): Promise<NextResponse | void> {
  const session = await getSession()
  const pathname = req.nextUrl.pathname
  const isAppRoute = pathname.startsWith('/app')

  if (isAppRoute) {
    const isLoggedIn = !!session.account?.id
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
}
