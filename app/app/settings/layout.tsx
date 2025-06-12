import '@scss/app/settings.scss'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { title } from '@util/metadata'

export const metadata: Metadata = {
  title: `${title} | Settings`
}

export interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return <div className="container page">{children}</div>
}
