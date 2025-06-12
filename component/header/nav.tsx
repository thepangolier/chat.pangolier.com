'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useMemo } from 'react'

interface HeaderNavProps {
  /** Target path for this link */
  href: string
  /** Link label or content */
  children: ReactNode
}

/**
 * A navigation link styled as a button that highlights itself
 * when the current route exactly matches its `href`.
 *
 * Uses `useMemo` to only recompute `isActive` when `pathname` or `href` change.
 *
 * @param href - URL path this button points to.
 * @param children - Visible label or elements inside the link.
 */
export default function HeaderNav({ href, children }: HeaderNavProps) {
  const pathname = usePathname()
  const isActive = useMemo(() => pathname === href, [pathname, href])

  return (
    <Link href={href} className={`button${isActive ? ' active' : ''}`}>
      {children}
    </Link>
  )
}
