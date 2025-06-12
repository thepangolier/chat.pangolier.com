import type { Metadata } from 'next'
import { ArticleJsonLd } from 'next-seo'

/**
 * Properties for the ArticleLD component, which emits JSON-LD structured data for an article.
 *
 * @property metadata - Next.js metadata object containing title, description, OpenGraph images, authors, and application name.
 * @property publishedTime - ISO 8601 formatted publication date for the article.
 * @property useAppDir - Determines whether the App Router `useAppDir` flag is applied to the JSON-LD output.
 */
export interface ArticleLDProps {
  metadata: Metadata
  publishedTime: string
  useAppDir?: boolean
}

/**
 * Injects an ArticleJsonLd component for SEO, resolving values from Next.js metadata.
 * It ensures the title, description, images, author names, and publisher information are correctly formatted.
 *
 * @param props.metadata - Metadata object providing article details.
 * @param props.publishedTime - Publication date to include in the JSON-LD.
 * @param props.useAppDir - Optional flag to enable App Router path in JSON-LD; defaults to true.
 * @returns A configured ArticleJsonLd component with structured data for the article.
 */
export function ArticleLD({
  metadata,
  publishedTime,
  useAppDir = true
}: ArticleLDProps) {
  const { title, description, openGraph, authors, applicationName } = metadata

  const resolvedTitle = title?.toString() ?? ''

  const images: string[] = openGraph?.images
    ? Array.isArray(openGraph.images)
      ? openGraph.images.map((img) =>
          typeof img === 'string'
            ? img
            : 'url' in img
              ? img.url.toString()
              : img.toString()
        )
      : [
          typeof openGraph.images === 'string'
            ? openGraph.images
            : 'url' in openGraph.images
              ? openGraph.images.url.toString()
              : openGraph.images.toString()
        ]
    : []

  const authorName = Array.isArray(authors) ? authors : authors ? [authors] : []

  return (
    <ArticleJsonLd
      useAppDir={useAppDir}
      url={openGraph?.url?.toString() ?? ''}
      title={resolvedTitle}
      description={description ?? ''}
      images={images}
      datePublished={publishedTime}
      authorName={authorName}
      publisherName={applicationName ?? ''}
      publisherLogo={images.length > 0 ? images[0] : ''}
    />
  )
}
