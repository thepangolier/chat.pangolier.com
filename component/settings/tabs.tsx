'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'account', href: '/app/settings' },
  { label: 'profile', href: '/app/settings/profile' },
  { label: 'security', href: '/app/settings/security' }
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
