'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode, useMemo } from 'react'

interface HeaderNavProps {
  /** Target path for this link (optional). If omitted, the element will be rendered as a plain button. */
  href?: string
  /** Optional click handler when rendered as a button or link. */
  onClick?: () => void
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
export default function HeaderNav({ href, onClick, children }: HeaderNavProps) {
  const pathname = usePathname()
  const isActive = useMemo(
    () => (href ? pathname === href : false),
    [pathname, href]
  )

  // When an href is provided, render a Next.js Link; otherwise, render a button.
  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`button${isActive ? ' active' : ''}`}
      >
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className="button">
      {children}
    </button>
  )
}
