import '@scss/pangolier.scss'
import type { Metadata } from 'next'
import { WebPageJsonLd } from 'next-seo'
import type { ReactNode } from 'react'
import ToastProvider from '@component/shared/toast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { defaultBrand, GenerateMetadata } from '@util/metadata'

export const metadata: Metadata = GenerateMetadata()

export interface LayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}
        >
          {children}
        </GoogleOAuthProvider>
        <ToastProvider />
        <WebPageJsonLd
          id="root"
          useAppDir={true}
          url={metadata.openGraph?.url}
          title={metadata.title}
          name={metadata.title}
          description={metadata.description || ''}
          images={metadata.openGraph?.images}
          keywords={((metadata.keywords as string[]) || [])?.join(', ')}
          publisher={{ name: defaultBrand }}
          inLanguage="en-US"
        />
      </body>
    </html>
  )
}
