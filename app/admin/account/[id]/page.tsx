import type { Account } from 'prisma/client'
import { getAccountAction } from '@action/admin/account/[id]'
import AdminAccount from '@component/admin/account'

/**
 * Props for the AdminAccount page.
 *
 * @property params - A Promise resolving to an object with the dynamic route params.
 */
export interface AdminAccountProps {
  params: Promise<{ id: string }>
}

/**
 * Server component that fetches and displays an account by its ID.
 *
 * @param props.params - Promise resolving to route parameters containing the account ID.
 */
export default async function AdminAccountPage({ params }: AdminAccountProps) {
  const { id } = await params
  const res = await getAccountAction({ id })

  if (!res.ok || !res.result) {
    return <div className="container page">Error: {res.message}</div>
  }

  const account = res.result as Account

  return (
    <div className="container page">
      <AdminAccount account={account} />
    </div>
  )
}
