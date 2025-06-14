import type { Metadata } from 'next'
import SecuritySettings from '@component/settings/security'

export const metadata: Metadata = {
  title: `Security Settings`
}

export default function SecuritySettingsPage() {
  return <SecuritySettings />
}
