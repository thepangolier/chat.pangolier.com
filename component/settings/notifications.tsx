'use client'
import { useCallback, useState } from 'react'
import { toast } from 'react-toastify'
import { updateNotificationsAction } from '@action/account/update/notifications'
import Switch from '@component/shared/switch'
import { useSession } from '@context/session'

export default function NotificationSettings() {
  const { account, setAccount } = useSession()

  const [notifyAll, setNotifyAll] = useState(account?.notifyAll ?? true)
  const [notifyUpdates, setNotifyUpdates] = useState(
    account?.notifyUpdates ?? true
  )
  const [notifyDeals, setNotifyDeals] = useState(account?.notifyDeals ?? true)

  const hasChanges =
    !!account &&
    (notifyAll !== (account.notifyAll ?? true) ||
      notifyUpdates !== (account.notifyUpdates ?? true) ||
      notifyDeals !== (account.notifyDeals ?? true))

  const handleSave = useCallback(async () => {
    try {
      const payload = await updateNotificationsAction({
        notifyAll,
        notifyUpdates,
        notifyDeals
      })

      if (payload.ok) {
        toast.success(payload.message)
        setAccount({
          ...account!,
          notifyAll,
          notifyUpdates,
          notifyDeals
        })
        // No need to reset `hasChanges`; it becomes false automatically
        // because `account` now matches the three local states.
      } else {
        toast.error(payload.message)
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(message)
    }
  }, [notifyAll, notifyUpdates, notifyDeals, account, setAccount])

  return (
    <div className="settings-content">
      <div className="settings-card">
        <h2>Notification Preferences</h2>

        <div className="settings-preferences">
          <div className="settings-preference">
            <div className="preference-info">
              <h3>Account Activity</h3>
              <p>Email me when changes happen to my account</p>
            </div>
            <div className="preference-switch">
              <span>OFF</span>
              <Switch on={notifyAll} setOn={setNotifyAll} />
              <span>ON</span>
            </div>
          </div>

          <div className="settings-preference">
            <div className="preference-info">
              <h3>Product Updates</h3>
              <p>Email me about updates to the Product</p>
            </div>
            <div className="preference-switch">
              <span>OFF</span>
              <Switch on={notifyUpdates} setOn={setNotifyUpdates} />
              <span>ON</span>
            </div>
          </div>

          <div className="settings-preference">
            <div className="preference-info">
              <h3>Special Deals</h3>
              <p>Email me about deals for the Product</p>
            </div>
            <div className="preference-switch">
              <span>OFF</span>
              <Switch on={notifyDeals} setOn={setNotifyDeals} />
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
      </div>
    </div>
  )
}
