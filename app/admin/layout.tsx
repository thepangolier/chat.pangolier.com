import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import AdminHeader from '@component/admin/header'
import { title } from '@util/metadata'

export const metadata: Metadata = {
  title: `${title} | Admin`,
  description: `Admin of an ${title} web application`
}

export interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div id="admin">
      <AdminHeader />
      {children}
    </div>
  )
}
