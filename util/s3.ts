import { S3Client } from '@aws-sdk/client-s3'

export const S3_API_KEY = process.env.S3_API_KEY || ''
export const S3_API_SECRET = process.env.S3_API_SECRET || ''
export const S3_BUCKET = process.env.S3_BUCKET || ''
export const S3_REGION = process.env.S3_REGION || ''

export const SIGNATURE_EXPIRATION_DOWNLOAD = 60 * 60 * 24 * 1 // 1 day
export const SIGNATURE_EXPIRATION_UPLOAD = 60 * 60 * 1 // 1 hour

export const s3 = new S3Client({
  region: S3_REGION,
  forcePathStyle: true,
  credentials: {
    accessKeyId: S3_API_KEY,
    secretAccessKey: S3_API_SECRET
  }
})
