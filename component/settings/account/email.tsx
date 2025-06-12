'use client'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import sendCodeAction from '@action/account/email/send.code'
import verifyCodeAction from '@action/account/email/verify.code'
import getAccount from '@action/account/session'
import Popup from '@component/shared/popup'
import { useSession } from '@context/session'
import { EMAIL_REGEX } from '@util/validation'

export default function ChangeEmail() {
  const { account, setAccount } = useSession()
  const [email, setEmail] = useState(account?.email ?? '')
  const [popup, setPopup] = useState(false)
  const [code, setCode] = useState('')
  const [isPending, startTransition] = useTransition()

  // Detect if the entered email differs from the current one
  const hasChanges = useMemo(() => {
    return email !== '' && email !== (account.email ?? '')
  }, [email, account])

  /**
   * Sends a verification code to the provided email address.
   */
  const handleSend = async () => {
    try {
      if (!email || !EMAIL_REGEX.test(email)) {
        toast.error('Invalid email address')
        return
      }

      if (email === account?.email) {
        toast.error('Email cannot be the same as the current email')
        return
      }

      const payload = await sendCodeAction({ email })
      if (payload.ok) {
        toast.success(payload.message)
        setPopup(true)
      } else {
        toast.error(payload.message)
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(message)
    }
  }

  /**
   * Verifies the code entered by the user to change the email.
   */
  const handleVerify = async () => {
    startTransition(async () => {
      try {
        const payload = await verifyCodeAction({ code })
        if (payload.ok) {
          toast.success(payload.message)
          const { result } = await getAccount()
          if (!result) return
          setAccount(result)
          setPopup(false)
        } else {
          toast.error(payload.message)
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred'
        toast.error(message)
      }
    })
  }

  return (
    <>
      {/* Verification Popup */}
      <Popup style="centered" visible={popup} setVisible={setPopup}>
        <h2>Verify Code</h2>
        <p>An email has been sent to your requested email</p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (!code) return
            handleVerify()
          }}
        >
          <input
            type="text"
            placeholder="Confirmation Code"
            value={code}
            onChange={(e) => setCode(e.target.value.trim())}
          />
          <div className="form-actions">
            <button type="button" onClick={() => setPopup(false)}>
              Cancel
            </button>
            <button type="submit" disabled={isPending}>
              Change Email
            </button>
          </div>
        </form>
      </Popup>

      {/* Email Input */}
      <form
        className="settings-email-form"
        onSubmit={(e) => {
          e.preventDefault()
          if (!hasChanges || isPending) return
          startTransition(handleSend)
        }}
      >
        <input
          type="email"
          placeholder="tim@apple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
        />
        <button disabled={!hasChanges || isPending}>
          {isPending ? 'Sending...' : 'Send Verification Code'}
        </button>
      </form>
    </>
  )
}
