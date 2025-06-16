import type { Metadata } from 'next'
import ProfileSettings from '@component/settings/profile'

export const metadata: Metadata = {
  title: `Profile Settings`
}

export default function ProfileSettingsPage() {
  return <ProfileSettings />
}
