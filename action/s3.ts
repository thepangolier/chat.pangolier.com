'use server'
import { unstable_cache } from 'next/cache'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  s3,
  S3_BUCKET,
  SIGNATURE_EXPIRATION_DOWNLOAD,
  SIGNATURE_EXPIRATION_UPLOAD
} from '@util/s3'

/*
 * Presigns an S3 *download* URL. Separated so it can be wrapped by
 * `unstable_cache` below.
 */
async function presignS3Download(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })
  return getSignedUrl(s3, command, { expiresIn: SIGNATURE_EXPIRATION_DOWNLOAD })
}

/*
 * Returns a presigned URL cached for exactly the same duration as its
 * validity period. `unstable_cache` persists across lambda invocations
 * and automatically revalidates after `SIGNATURE_EXPIRATION_DOWNLOAD`.
 */
export const cachedS3Url = unstable_cache(presignS3Download, ['s3-presign'], {
  revalidate: SIGNATURE_EXPIRATION_DOWNLOAD
})

/*
 * Upload helper unchanged, kept here for completeness
 */
export async function presignS3Upload(
  url: string,
  type: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: S3_BUCKET,
    Key: url,
    ContentType: type
  })
  return getSignedUrl(s3, command, { expiresIn: SIGNATURE_EXPIRATION_UPLOAD })
}
