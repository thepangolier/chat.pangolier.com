'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  type AnchorHTMLAttributes,
  forwardRef,
  type ReactNode,
  useMemo
} from 'react'

/*
 * Navigation element that always renders an anchor tag.
 * • Renders a Next.js `Link` when `href` is provided; otherwise a plain `<a role="button">`.
 * • Adds the `active` class when the current route exactly matches `href`.
 *
 * @param href     - Destination URL (optional).
 * @param children - Visible label or elements.
 * @param className - Additional CSS classes.
 * @returns An anchor element for navigation or actions.
 */
export interface HeaderNavProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> {
  children: ReactNode
}

const HeaderNav = forwardRef<HTMLAnchorElement, HeaderNavProps>(
  ({ href, className = '', children, ...rest }, ref) => {
    const pathname = usePathname()
    const isActive = useMemo(
      () => (href ? pathname === href : false),
      [pathname, href]
    )

    const classes = `button${isActive ? ' active' : ''}${
      className ? ` ${className}` : ''
    }`

    if (href) {
      return (
        <Link ref={ref} href={href} className={classes} {...rest}>
          {children}
        </Link>
      )
    }

    return (
      <a ref={ref} role="button" tabIndex={0} className={classes} {...rest}>
        {children}
      </a>
    )
  }
)

HeaderNav.displayName = 'HeaderNav'
export default HeaderNav
