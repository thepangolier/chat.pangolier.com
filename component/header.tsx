'use client'
import '@scss/app/header.scss'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '@assets/img/logo.png'
import LogoutButton from '@component/header/logout'
import HeaderNav from '@component/header/nav'
import { IconSettings } from '@component/shared/icon'

export default function AppHeader() {
  return (
    <header>
      <Link className="brand" href="/app">
        <Image src={Logo} alt="Logo" />
      </Link>

      <div className="app-menu">
        <HeaderNav href="/app/settings">
          <IconSettings />
          <div className="tooltip">Settings</div>
        </HeaderNav>
        <LogoutButton />
      </div>
    </header>
  )
}
