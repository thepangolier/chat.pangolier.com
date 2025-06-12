'use client'
import { useState } from 'react'
import AccountSettings from '@component/settings/account'
import NotificationSettings from '@component/settings/notifications'
import ProfileSettings from '@component/settings/profile'
import SecuritySettings from '@component/settings/security'

export type TabType = 'account' | 'profile' | 'notifications' | 'security'

export const Tabs: TabType[] = [
  'account',
  'profile',
  'notifications',
  'security'
]

export default function SettingsPage() {
  const [tab, setTab] = useState<TabType>('account')

  return (
    <div id="settings">
      <div className="settings-tabs">
        {Tabs.map((v) => (
          <button
            key={v}
            className={tab === v ? 'active' : ''}
            onClick={() => setTab(v)}
          >
            {v}
          </button>
        ))}
        <button>Billing</button>
      </div>
      {tab === 'account' && <AccountSettings />}
      {tab === 'profile' && <ProfileSettings />}
      {tab === 'notifications' && <NotificationSettings />}
      {tab === 'security' && <SecuritySettings />}
    </div>
  )
}
