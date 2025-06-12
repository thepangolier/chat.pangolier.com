import { type ChangeEvent, type FocusEvent, useCallback, useState } from 'react'
import { validatePassword } from '@util/validation'

/**
 * Props for the RegisterPasswordInput component.
 */
export interface RegisterPasswordInputProps {
  password: string
  confirmPassword: string
  onPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onValidationChange: (isValid: boolean) => void
}

/**
 * Controlled password / confirm-password input pair with inline validation.
 */
export default function RegisterPasswordInput({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  onValidationChange
}: RegisterPasswordInputProps) {
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [passwordValid, setPasswordValid] = useState(false)
  const [confirmValid, setConfirmValid] = useState(false)

  /** Sends the composite validity to the parent exactly once per change. */
  const syncValidity = useCallback(
    (nextPwdValid: boolean, nextConfValid: boolean): void => {
      onValidationChange(nextPwdValid && nextConfValid)
    },
    [onValidationChange]
  )

  /** Fired on blur of the password field. */
  const handlePasswordBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>): void => {
      const pwd = e.target.value
      const { valid, message } = validatePassword(pwd)

      let nextPwdValid = false
      if (!valid && pwd.length > 0) {
        setPasswordError(message ?? 'Invalid password')
      } else {
        setPasswordError(null)
        nextPwdValid = pwd.length > 0
      }
      setPasswordValid(nextPwdValid)

      let nextConfValid = confirmValid
      if (confirmPassword) {
        if (pwd === confirmPassword) {
          setConfirmError(null)
          nextConfValid = confirmPassword.length > 0
        } else {
          setConfirmError('Passwords do not match')
          nextConfValid = false
        }
        setConfirmValid(nextConfValid)
      }

      syncValidity(nextPwdValid, nextConfValid)
    },
    [confirmPassword, confirmValid, syncValidity]
  )

  /** Fired on blur of the confirm-password field. */
  const handleConfirmBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>): void => {
      const confirm = e.target.value
      const nextConfValid = confirm === password && confirm.length > 0

      setConfirmError(nextConfValid ? null : 'Passwords do not match')
      setConfirmValid(nextConfValid)
      syncValidity(passwordValid, nextConfValid)
    },
    [password, passwordValid, syncValidity]
  )

  /** Fired while typing in the password field. */
  const handlePasswordChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const next = e.target.value
      onPasswordChange(next)

      if (passwordError) setPasswordError(null)
      if (passwordValid) setPasswordValid(false)
      if (confirmError || confirmValid) {
        setConfirmError(null)
        setConfirmValid(false)
      }
      syncValidity(false, false)
    },
    [
      onPasswordChange,
      passwordError,
      passwordValid,
      confirmError,
      confirmValid,
      syncValidity
    ]
  )

  /** Fired while typing in the confirm-password field. */
  const handleConfirmChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      onConfirmPasswordChange(e.target.value)
      if (confirmError) setConfirmError(null)
      if (confirmValid) setConfirmValid(false)
      syncValidity(passwordValid, false)
    },
    [
      onConfirmPasswordChange,
      confirmError,
      confirmValid,
      passwordValid,
      syncValidity
    ]
  )

  return (
    <div className="form-input">
      <p>Password</p>
      <input
        type="password"
        className={passwordError ? 'red' : passwordValid ? 'green' : ''}
        value={password}
        onChange={handlePasswordChange}
        onBlur={handlePasswordBlur}
        placeholder="Password"
      />
      <div className={`message${passwordError ? ' visible' : ''}`}>
        {passwordError}
      </div>

      <p>Confirm Password</p>
      <input
        type="password"
        className={confirmError ? 'red' : confirmValid ? 'green' : ''}
        value={confirmPassword}
        onChange={handleConfirmChange}
        onBlur={handleConfirmBlur}
        placeholder="Confirm Password"
      />
      <div className={`message${confirmError ? ' visible' : ''}`}>
        {confirmError}
      </div>
    </div>
  )
}
