'use client'
import Image, { type ImageLoader, type ImageProps } from 'next/image'
import { useState } from 'react'
import { IconSpinner } from '@component/shared/icon'

/*
 * URL-safe maximum width your media endpoint can serve.
 */
const MAX_ORIGINAL_WIDTH = 2048

/*
 * Loader that converts an S3 key into the internal `/media` route so that
 * Next.js can optimise the asset.
 *
 * @param src     - S3 object key, e.g. `app/1/abc/logo.png`.
 * @param width   - Target width requested by Next.js optimiser.
 * @param quality - Target quality requested by Next.js optimiser.
 * @returns A URL pointing at the `/media` redirect route.
 */
const s3Loader: ImageLoader = ({ src, width, quality }) =>
  `/media?url=${encodeURIComponent(src)}&w=${Math.min(
    width,
    MAX_ORIGINAL_WIDTH
  )}&q=${quality ?? 75}`

/*
 * Props for the S3Image component.
 *
 * @property s3Key            - The S3 object key (no leading slash, no query string).
 * @property wrapperClassName - **Optional** extra classes for the outer wrapper.
 */
export interface S3ImageProps extends Omit<ImageProps, 'src' | 'loader'> {
  s3Key: string
  wrapperClassName?: string
}

/**
 * Renders an S3-hosted image via Next.js `<Image>` with a spinner placeholder
 * that matches its bounds. The image lazy-loads and fades in on load.
 *
 * @param props - {@link S3ImageProps} configuration.
 * @returns A React element.
 */
export default function S3Image({
  s3Key,
  wrapperClassName,
  className,
  onLoad,
  ...props
}: S3ImageProps) {
  const [loaded, setLoaded] = useState(false)
  const isRemote = /^https?:\/\//.test(s3Key)

  return (
    <div
      className={`s3-image ${wrapperClassName ?? 's3-image-generic'}`}
      style={{
        width: props.fill ? '100%' : props.width,
        height: props.fill ? '100%' : props.height
      }}
    >
      <div className="spinner-container" style={{ opacity: loaded ? 0 : 1 }}>
        <IconSpinner />
      </div>

      <Image
        {...props}
        src={s3Key}
        loading="lazy"
        onLoad={(e) => {
          setLoaded(true)
          onLoad?.(e)
        }}
        // use the S3 loader only for internal keys
        loader={isRemote ? undefined : s3Loader}
        className={`image ${loaded ? 'image-visible' : ''} ${className ?? ''}`}
      />
    </div>
  )
}
