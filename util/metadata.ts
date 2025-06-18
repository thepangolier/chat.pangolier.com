import type { Metadata } from 'next'

export const title = 'Pangolier Chat'

export const defaultBrand = 'Pangolier Chat'

export const defaultDescription =
  'A free, open-source chat app built for seamless collaboration'

export const siteUrl = 'https://chat.pangolier.com'

export const defaultOgImage = `${siteUrl}/assets/img/og.png`

export interface BaseMeta {
  title?: string
  description?: string
  ogImage?: string
  canonicalPath?: `/${string}`
  noindex?: boolean
}

export function GenerateMetadata({
  title = defaultBrand,
  description = defaultDescription,
  ogImage = defaultOgImage,
  canonicalPath,
  noindex = false
}: BaseMeta = {}): Metadata {
  const canonical = canonicalPath
    ? new URL(canonicalPath, siteUrl).toString()
    : siteUrl

  return {
    title,
    description,
    robots: { index: !noindex, follow: !noindex },
    alternates: { canonical },
    openGraph: {
      title,
      description,
      siteName: defaultBrand,
      url: canonical,
      type: 'website',
      locale: 'en_US',
      images: ogImage
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage,
      site: '@thepangolier',
      creator: '@thepangolier'
    }
  }
}

export interface BlogMeta extends BaseMeta {
  publishedTime: string // ISO 8601
  modifiedTime?: string
  section?: string
  tags?: string[]
  authorUrl?: string
}

export function GenerateBlogMetadata({
  title,
  description = defaultDescription,
  ogImage = defaultOgImage,
  canonicalPath,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  authorUrl
}: BlogMeta): Metadata {
  const meta = GenerateMetadata({
    title,
    description,
    ogImage,
    canonicalPath
  })

  meta.openGraph = {
    ...meta.openGraph!,
    type: 'article',
    publishedTime,
    modifiedTime,
    section,
    tags,
    authors: authorUrl ? [authorUrl] : undefined
  }

  return meta
}
