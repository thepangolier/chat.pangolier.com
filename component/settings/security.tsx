'use client'
import { useMemo, useState } from 'react'
import { toast } from 'react-toastify'
import { updateEmailCodeAction } from '@action/account/update/email.code'
import ResetPassword from '@component/settings/password/reset'
import SetPassword from '@component/settings/password/set'
import Switch from '@component/shared/switch'
import { useSession } from '@context/session'

export default function SecuritySettings() {
  const { account, setAccount } = useSession()
  const [requireEmailCode, setRequireEmailCode] = useState(
    account?.requireEmailCode ?? false
  )
  const hasChanges = useMemo(() => {
    if (!account) return false
    return requireEmailCode !== (account.requireEmailCode ?? false)
  }, [requireEmailCode, account])

  const handleSave = async () => {
    try {
      const payload = await updateEmailCodeAction({
        requireEmailCode
      })

      if (payload.ok) {
        toast.success(payload.message)
        setAccount({
          ...account!,
          requireEmailCode
        })
      } else {
        toast.error(payload.message)
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(message)
    }
  }

  console.log(account)

  return (
    <div className="settings-content">
      <div className="settings-card">
        <h2>Security Settings</h2>

        <div className="settings-preferences">
          <div className="settings-preference">
            <div className="preference-info">
              <h3>Two-Factor Authentication</h3>
              <p>Require an email verification code during login</p>
            </div>
            <div className="preference-switch">
              <span>OFF</span>
              <Switch on={requireEmailCode} setOn={setRequireEmailCode} />
              <span>ON</span>
            </div>
          </div>
        </div>

        <button
          className={`settings-save ${hasChanges ? 'visible' : ''}`}
          onClick={handleSave}
          disabled={!hasChanges}
        >
          Save Changes
        </button>

        <div className="settings-reset">
          <h3>Password Management</h3>
          {account?.password ? <ResetPassword /> : <SetPassword />}
        </div>
      </div>
    </div>
  )
}
