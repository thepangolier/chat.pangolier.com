'use client'
import '@scss/app/header.scss'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@assets/img/logo.png'
import LogoutButton from '@component/header/logout'
import HeaderNav from '@component/header/nav'
import {
  IconCopy,
  IconHistory,
  IconPencil,
  IconSettings
} from '@component/shared/icon'
import { useSession } from '@context/session'

export default function AppHeader() {
  const { setHistoryPopup } = useSession()
  const pathname = usePathname()
  return (
    <header>
      <div className={`container ${pathname === '/app' ? 'chat' : 'normal'}`}>
        <Link className="brand" href="/app">
          <Image src={Logo} alt="Logo" />
        </Link>

        <div className="app-menu">
          <HeaderNav href="/app">
            <IconPencil />
            <div className="tooltip">New Chat</div>
          </HeaderNav>
          <HeaderNav href="/app">
            <IconCopy />
            <div className="tooltip">Copy Link</div>
          </HeaderNav>
          <HeaderNav onClick={() => setHistoryPopup(true)}>
            <IconHistory />
            <div className="tooltip">History</div>
          </HeaderNav>
          <HeaderNav href="/app/settings">
            <IconSettings />
            <div className="tooltip">Settings</div>
          </HeaderNav>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
