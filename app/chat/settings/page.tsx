import type { Metadata } from 'next'
import AccountSettings from '@component/settings/account'

export const metadata: Metadata = {
  title: `Account Settings`
}

export default function SettingsPage() {
  return <AccountSettings />
}
