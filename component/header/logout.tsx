'use client'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import logoutAction from '@action/account/logout'
import { IconLogout, IconSpinner } from '@component/shared/icon'

/**
 * Renders a logout button that handles the user logout flow.
 *
 * @remarks
 * Disables itself while the logoutAction is in progress and
 * shows a spinner via IconSpinner during the operation.
 */
export default function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false)

  const handleLogout = useCallback(async (): Promise<void> => {
    if (isLoggingOut) return

    try {
      setIsLoggingOut(true)
      const result = await logoutAction()

      if (result.ok) {
        router.push('/')
      } else {
        toast.error(result.message || 'Failed to log out')
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('An error occurred during logout')
      setIsLoggingOut(false)
    }
  }, [isLoggingOut, router])

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={isLoggingOut ? 'loading' : ''}
    >
      {isLoggingOut ? <IconSpinner /> : <IconLogout />}
      <div className="tooltip">Logout</div>
    </button>
  )
}
