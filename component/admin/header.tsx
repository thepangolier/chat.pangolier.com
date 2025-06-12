'use client'
import '@scss/app/header.scss'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Logo from '@assets/img/logo.png'
import LogoutButton from '@component/header/logout'
import HeaderNav from '@component/header/nav'

export default function AdminHeader() {
  const pathname = usePathname()

  if (pathname === '/admin/login') {
    return null
  }

  return (
    <header>
      <div className="container">
        <Link className="brand" href="/admin">
          <Image src={Logo} alt="Logo" />
          Admin
        </Link>

        <div className="app-menu">
          <HeaderNav href="/admin">Accounts</HeaderNav>
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
