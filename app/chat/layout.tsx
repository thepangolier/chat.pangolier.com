import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import getAccount from '@action/account/session'
import ChatHistory from '@component/chat/history'
import AppHeader from '@component/header'
import { SessionProvider } from '@context/session'
import { title } from '@util/metadata'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${title}`,
  description: `The ${title} Web Application`
}

export interface AppLayoutProps {
  children: ReactNode
}

/*
 * Root application layout that enforces authentication.
 *
 * If no account is returned by `getAccount`, the user is redirected
 * to the landing page (`/`). Otherwise, the authenticated session is
 * provided to the React tree via {@link SessionProvider}.
 *
 * @param children - Descendant page content.
 */
export default async function AppLayout({ children }: AppLayoutProps) {
  const { result: account } = await getAccount()

  if (!account) redirect('/')

  return (
    <SessionProvider initialAccount={account}>
      <AppHeader />
      <ChatHistory />
      {children}
    </SessionProvider>
  )
}
