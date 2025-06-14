'use client'
import '@scss/app/header.scss'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import Logo from '@assets/img/logo.png'
import LogoutButton from '@component/header/logout'
import HeaderNav from '@component/header/nav'
import {
  IconAccount,
  IconEllipsis,
  IconHistory,
  IconLock,
  IconPencil,
  IconProfile
} from '@component/shared/icon'
import { useSession } from '@context/session'

export default function AppHeader() {
  const { setHistoryPopup } = useSession()
  const pathname = usePathname()
  const [menu, setMenu] = useState(false)
  const toggleRef = useRef<HTMLAnchorElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  const handleDocumentClick = useCallback((evt: MouseEvent) => {
    const target = evt.target as Node

    if (
      (toggleRef.current && toggleRef.current.contains(target)) ||
      (menuRef.current && menuRef.current.contains(target))
    ) {
      return
    }
    setMenu(false)
  }, [])

  useEffect(() => {
    if (!menu) return
    document.addEventListener('mousedown', handleDocumentClick)
    return () => document.removeEventListener('mousedown', handleDocumentClick)
  }, [menu, handleDocumentClick])

  function closeMenuThen<T extends HTMLElement>(
    original?: (e: ReactMouseEvent<T>) => void
  ): (e: ReactMouseEvent<T>) => void {
    return (e) => {
      original?.(e)
      setMenu(false)
    }
  }

  return (
    <header>
      <div className={`container ${pathname === '/app' ? 'chat' : 'normal'}`}>
        <Link className="brand" href="/app">
          <Image src={Logo} alt="Logo" />
        </Link>

        <div
          className={`main-menu ${menu ? 'dropdown-visible' : 'dropdown-invisible'}`}
        >
          <HeaderNav
            href="/app"
            style={{
              opacity: pathname === '/app' ? 0 : 1,
              pointerEvents: pathname === '/app' ? 'none' : 'auto'
            }}
          >
            <IconPencil />
            <div className="tooltip">New Chat</div>
          </HeaderNav>

          <HeaderNav onClick={() => setHistoryPopup(true)}>
            <IconHistory />
            <div className="tooltip">History</div>
          </HeaderNav>

          <HeaderNav ref={toggleRef} onClick={() => setMenu((open) => !open)}>
            <IconEllipsis />
            <div className="tooltip">Settings</div>
          </HeaderNav>
        </div>

        <div
          ref={menuRef}
          className={`dropdown-menu ${menu ? 'visible' : 'invisible'}`}
          onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}
          role="menu"
          tabIndex={-1}
        >
          <div
            className="dropdown-menu-content"
            onClick={closeMenuThen()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}
          >
            <HeaderNav href="/app/settings">
              <IconAccount /> Account
            </HeaderNav>
            <HeaderNav href="/app/settings/profile">
              <IconProfile /> Profile
            </HeaderNav>
            <HeaderNav href="/app/settings/security">
              <IconLock /> Security
            </HeaderNav>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  )
}
