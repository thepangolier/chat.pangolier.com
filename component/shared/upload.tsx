'use client'
import 'react-easy-crop/react-easy-crop.css'
import '@scss/app/upload.scss'
import { type ReactNode, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import Cropper from 'react-easy-crop'
import { presignS3Upload } from '@action/s3'
import { IconSpinner } from '@component/shared/icon'

/*
 * Generates a random alphanumeric string.
 *
 * @param length - Desired string length.
 * @returns Random string of `length` characters.
 */
function randomString(length = 5): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

/*
 * Returns a Blob containing the cropped sub-rectangle of an image.
 *
 * @param src       - Image source as a data-URL.
 * @param cropPx    - Cropped rectangle in pixel coordinates.
 * @param mimeType  - MIME type of the original image.
 * @returns Promise resolving to a Blob of the cropped image.
 */
async function getCroppedBlob(
  src: string,
  cropPx: { x: number; y: number; width: number; height: number },
  mimeType: string
): Promise<Blob> {
  const img = document.createElement('img')
  img.src = src
  await new Promise((r) => (img.onload = r))

  const canvas = document.createElement('canvas')
  canvas.width = cropPx.width
  canvas.height = cropPx.height

  const ctx = canvas.getContext('2d')!
  ctx.drawImage(
    img,
    cropPx.x,
    cropPx.y,
    cropPx.width,
    cropPx.height,
    0,
    0,
    cropPx.width,
    cropPx.height
  )

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mimeType))
}

/*
 * Props for the UploadDropzone component.
 */
export interface UploadDropzoneProps {
  aspect?: number
  label?: ReactNode
  prefix?: string
  setUrl(v: string): void
  loading?: boolean
  setLoading?(v: boolean): void
}

/*
 * Dropzone with client-side image cropping prior to S3 upload.
 */
export default function UploadDropzone({
  aspect = 1,
  label = <p>Drop a photo or click to upload</p>,
  prefix,
  setUrl,
  loading,
  setLoading
}: UploadDropzoneProps) {
  const [progress, setProgress] = useState(0)
  const [internalLoading, setInternalLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedPx, setCroppedPx] = useState<{
    x: number
    y: number
    width: number
    height: number
  } | null>(null)

  const isLoading = loading ?? internalLoading
  const updateLoading = setLoading ?? setInternalLoading

  const uploadBlob = useCallback(
    async (blob: Blob, keyHint: string, mimeType: string) => {
      updateLoading(true)
      setProgress(0)

      const key = `app/${prefix ?? 'generic'}/${Date.now()}-${randomString()}/${keyHint}`
      const signedUploadUrl = await presignS3Upload(key, mimeType)

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.upload.onprogress = (evt) => {
          if (evt.lengthComputable)
            setProgress(Math.round((evt.loaded / evt.total) * 100))
        }
        xhr.onload = () =>
          xhr.status >= 200 && xhr.status < 300 ? resolve() : reject()
        xhr.onerror = () => reject()
        xhr.open('PUT', signedUploadUrl, true)
        xhr.setRequestHeader('Content-Type', mimeType)
        xhr.send(blob)
      })

      setUrl(key)
      updateLoading(false)
      setProgress(0)
      setSelectedFile(null)
      setPreviewUrl(null)
    },
    [prefix, setUrl, updateLoading]
  )

  const onDrop = useCallback(
    (files: File[]) => {
      if (files.length === 0 || isLoading) return
      const file = files[0]
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    },
    [isLoading]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: isLoading || Boolean(selectedFile)
  })

  const confirmCrop = async () => {
    if (!previewUrl || !selectedFile || !croppedPx) return
    const blob = await getCroppedBlob(previewUrl, croppedPx, selectedFile.type)
    await uploadBlob(blob, selectedFile.name, selectedFile.type)
  }

  if (selectedFile && previewUrl) {
    return (
      <div className="dropzone-cropper">
        <Cropper
          image={previewUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, croppedAreaPixels) =>
            setCroppedPx(croppedAreaPixels)
          }
        />

        <div className="dropzone-cropper-actions">
          <button
            className="dropzone-cropper-action"
            onClick={() => {
              setSelectedFile(null)
              setPreviewUrl(null)
            }}
          >
            Cancel
          </button>
          <button
            className="dropzone-cropper-action"
            onClick={confirmCrop}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                {progress}% <IconSpinner />
              </>
            ) : (
              'Crop & Upload'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      {isLoading ? (
        <p className="dropzone-loading-label">
          {progress}% <IconSpinner />
        </p>
      ) : (
        label
      )}
    </div>
  )
}
