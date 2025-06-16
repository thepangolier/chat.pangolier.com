'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'account', href: '/chat/settings' },
  { label: 'profile', href: '/chat/settings/profile' },
  { label: 'security', href: '/chat/settings/security' }
]

export default function SettingsTabs() {
  const pathname = usePathname()

  return (
    <div className="settings-tabs">
      {tabs.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className={
            pathname === href ? 'settings-link active' : 'settings-link'
          }
        >
          {label}
        </Link>
      ))}
    </div>
  )
}
