import { NextRequest, NextResponse } from 'next/server'
import { cachedS3Url } from '@action/s3'

/** Revalidate window (seconds).
 *  Must be a compile-time literal for Next.js. */
export const revalidate = 86_400

/*
 * Redirects `/image?url=<s3-key>` to a presigned S3 URL.
 * The redirect response is cache-controlled for the same
 * lifetime as the S3 signature.
 */
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get('url')

  if (!key) {
    return NextResponse.json({ error: 'missing url' }, { status: 400 })
  }

  const signed = await cachedS3Url(key)

  const res = NextResponse.redirect(signed, 307)
  res.headers.set(
    'Cache-Control',
    `public, max-age=${revalidate}, ` + `s-maxage=${revalidate}, immutable`
  )
  return res
}
