import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useMemo,
  useState
} from 'react'
import { toast } from 'react-toastify'
import { resetPasswordAction } from '@action/account/update/password.reset'
import { validatePassword } from '@util/validation'

/**
 * A controlled password-reset form that:
 * 1. Validates the new-password strength on blur,
 * 2. Validates the confirmation on blur,
 * 3. Shows inline errors inside a `.message` div,
 * 4. Applies the `red` class when invalid and the `green` class when valid,
 * 5. Calls the `resetPasswordAction` server action on submit.
 *
 * @returns The rendered password-reset form.
 */
export default function ResetPassword() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [currentError, setCurrentError] = useState<string | null>(null)
  const [newError, setNewError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  const [currentValid, setCurrentValid] = useState(false)
  const [newValid, setNewValid] = useState(false)
  const [confirmValid, setConfirmValid] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const formValid = useMemo(
    () => currentValid && newValid && confirmValid,
    [currentValid, newValid, confirmValid]
  )

  const handleCurrentBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length === 0) {
      setCurrentError('Current password is required')
      setCurrentValid(false)
    } else {
      setCurrentError(null)
      setCurrentValid(true)
    }
  }, [])

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

  const handleCurrentChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setCurrentPassword(e.target.value)
      if (currentError) setCurrentError(null)
      if (currentValid) setCurrentValid(false)
    },
    [currentError, currentValid]
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
        const result = await resetPasswordAction({
          currentPassword,
          newPassword,
          confirmNewPassword: confirmPassword
        })

        if (result.ok) {
          toast.success('Password updated successfully')
          /* Reset local state for a better UX. */
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
          setCurrentValid(false)
          setNewValid(false)
          setConfirmValid(false)
        } else {
          toast.error(result.message ?? 'Failed to update password')
        }
      } finally {
        setSubmitting(false)
      }
    },
    [formValid, currentPassword, newPassword, confirmPassword]
  )

  return (
    <form className="settings-password-form" onSubmit={handleSubmit}>
      <p className="form-copy">
        Enter your current password and set a new password to update your
        account security.
      </p>

      <label htmlFor="currentPassword">Current Password</label>
      <input
        id="currentPassword"
        type="password"
        className={currentError ? 'red' : currentValid ? 'green' : ''}
        value={currentPassword}
        onChange={handleCurrentChange}
        onBlur={handleCurrentBlur}
        placeholder="Current Password"
        required
      />
      <div className={`message${currentError ? ' visible' : ''}`}>
        {currentError}
      </div>

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
        {submitting ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  )
}
