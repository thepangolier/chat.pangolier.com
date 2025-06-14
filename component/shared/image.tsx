'use client'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { IconSpinner } from '@component/shared/icon'

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
        unoptimized
        src={isRemote ? s3Key : `/media?url=${encodeURIComponent(s3Key)}`}
        loading="lazy"
        onLoad={(e) => {
          setLoaded(true)
          onLoad?.(e)
        }}
        className={`image ${loaded ? 'image-visible' : ''} ${className ?? ''}`}
      />
    </div>
  )
}
