import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useMemo,
  useState
} from 'react'
import { toast } from 'react-toastify'
import { setPasswordAction } from '@action/account/update/password.set'
import { useSession } from '@context/session'
import { validatePassword } from '@util/validation'

/*
 * Controlled form to set an initial account password.
 *
 * Behaviour:
 * 1. Validates strength of the new password on blur.
 * 2. Validates confirmation on blur.
 * 3. Displays inline errors in a `.message` div.
 * 4. Applies `red` class when invalid, `green` when valid.
 * 5. Executes the `setPasswordAction` server action on submit.
 */
export default function SetPassword() {
  const { account, setAccount } = useSession()

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [newError, setNewError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const [newValid, setNewValid] = useState(false)
  const [confirmValid, setConfirmValid] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const formValid = useMemo(
    () => newValid && confirmValid,
    [newValid, confirmValid]
  )

  const handleNewBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const pwd = e.target.value
      const result = validatePassword(pwd)

      if (!result.valid) {
        setNewError(result.message ?? 'Invalid password')
        setNewValid(false)
      } else {
        setNewError(null)
        setNewValid(true)
      }

      /* Re-evaluate confirmation if it already exists. */
      if (confirmPassword) {
        if (pwd === confirmPassword && result.valid) {
          setConfirmError(null)
          setConfirmValid(true)
        } else {
          setConfirmError('Passwords do not match')
          setConfirmValid(false)
        }
      }
    },
    [confirmPassword]
  )

  const handleConfirmBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (value === newPassword && value.length > 0) {
        setConfirmError(null)
        setConfirmValid(true)
      } else {
        setConfirmError('Passwords do not match')
        setConfirmValid(false)
      }
    },
    [newPassword]
  )

  const handleNewChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setNewPassword(value)

      if (newError) setNewError(null)
      if (newValid) setNewValid(false)

      /* Reset confirmation state while typing. */
      if (confirmError) setConfirmError(null)
      if (confirmValid) setConfirmValid(false)
    },
    [newError, newValid, confirmError, confirmValid]
  )

  const handleConfirmChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setConfirmPassword(e.target.value)
      if (confirmError) setConfirmError(null)
      if (confirmValid) setConfirmValid(false)
    },
    [confirmError, confirmValid]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!formValid) {
        toast.error('Please fix validation errors before submitting')
        return
      }

      try {
        setSubmitting(true)
        const result = await setPasswordAction({
          newPassword,
          confirmPassword
        })

        if (result.ok) {
          setAccount({ ...account!, password: 'password-set' })
          toast.success('Password set successfully')

          /* Reset local state for clarity. */
          setNewPassword('')
          setConfirmPassword('')
          setNewValid(false)
          setConfirmValid(false)
        } else {
          toast.error(result.message ?? 'Failed to set password')
        }
      } finally {
        setSubmitting(false)
      }
    },
    [formValid, newPassword, confirmPassword, setAccount, account]
  )

  return (
    <form className="settings-password-form" onSubmit={handleSubmit}>
      <p className="form-copy">
        No password is currently set for your account. Please set a password to
        secure your account.
      </p>

      <label htmlFor="newPassword">New Password</label>
      <input
        id="newPassword"
        type="password"
        className={newError ? 'red' : newValid ? 'green' : ''}
        value={newPassword}
        onChange={handleNewChange}
        onBlur={handleNewBlur}
        placeholder="New Password"
        required
      />
      <div className={`message${newError ? ' visible' : ''}`}>{newError}</div>

      <label htmlFor="confirmPassword">Confirm New Password</label>
      <input
        id="confirmPassword"
        type="password"
        className={confirmError ? 'red' : confirmValid ? 'green' : ''}
        value={confirmPassword}
        onChange={handleConfirmChange}
        onBlur={handleConfirmBlur}
        placeholder="Confirm Password"
        required
      />
      <div className={`message${confirmError ? ' visible' : ''}`}>
        {confirmError}
      </div>

      <button
        type="submit"
        className="settings-save"
        disabled={!formValid || submitting}
      >
        {submitting ? 'Setting…' : 'Set Password'}
      </button>
    </form>
  )
}
