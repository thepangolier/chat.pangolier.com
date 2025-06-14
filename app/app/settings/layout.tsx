import '@scss/app/settings.scss'
import type { ReactNode } from 'react'
import SettingsTabs from '@component/settings/tabs'

export interface SettingsLayoutProps {
  children: ReactNode
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="container page">
      <div id="settings">
        <SettingsTabs />
        {children}
      </div>
    </div>
  )
}
