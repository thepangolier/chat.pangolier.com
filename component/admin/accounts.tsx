'use client'
import '@scss/generic/table.scss'
import Link from 'next/link'
import type { Account } from 'prisma/client'
import { useCallback, useEffect, useState } from 'react'
import { listAccountsAction } from '@action/admin/account/list'
import useDebounce from '@component/shared/debounce'
import { IconSpinner } from '@component/shared/icon'

export default function AdminAccounts() {
  const take = 10
  const [skip, setSkip] = useState(0)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 500)

  const fetchAccounts = useCallback(
    async (reset = false) => {
      setLoading(true)
      try {
        const res = await listAccountsAction({
          skip: reset ? 0 : skip,
          take,
          search: debouncedSearch
        })
        if (res.ok) {
          const newAccounts = res.result ?? []
          setAccounts((prev) =>
            reset ? newAccounts : [...prev, ...newAccounts]
          )
          setSkip((prev) =>
            reset ? newAccounts.length : prev + newAccounts.length
          )
          setHasMore(newAccounts.length === take)
          setError(null)
        } else {
          setError(res.message ?? 'Failed to load accounts')
        }
      } catch (err) {
        console.error('Error fetching accounts:', err)
        setError('Error fetching accounts')
      } finally {
        setLoading(false)
      }
    },
    [skip, take, debouncedSearch]
  )

  useEffect(() => {
    fetchAccounts(true)
  }, [debouncedSearch, fetchAccounts])

  return (
    <div className="admin-accounts">
      <input
        type="text"
        placeholder="Search Accounts"
        className="table-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Email 2FA?</th>
            <th>Google Connected?</th>
            <th>GitHub Connected?</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>{account.email}</td>
              <td>{account.name}</td>
              <td>{account.requireEmailCode ? 'Yes' : 'No'}</td>
              <td>{account.googleId ? 'Yes' : 'No'}</td>
              <td>{account.githubId ? 'Yes' : 'No'}</td>
              <td>{account.active ? 'Yes' : 'No'}</td>
              <td>
                <Link href={`/admin/account/${account.id}`}>Manage</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {error && <p className="error">{error}</p>}

      {hasMore && (
        <button
          className="button-table-load"
          disabled={loading}
          onClick={() => fetchAccounts()}
        >
          {loading ? <IconSpinner /> : 'Load More'}
        </button>
      )}
    </div>
  )
}
