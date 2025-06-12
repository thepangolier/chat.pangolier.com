import {
  type ChangeEvent,
  type FocusEvent,
  useCallback,
  useRef,
  useState
} from 'react'
import validateEmailAction from '@action/account/validate/email'
import { EMAIL_REGEX } from '@util/validation'

/**
 * Props for the EmailInput component.
 */
export interface EmailInputProps {
  /** The current email value. */
  value: string
  /** Called when the email text changes. */
  onChange: (value: string) => void
  /** Called when the validation status changes. */
  onValidationChange: (isValid: boolean) => void
}

/*
 * A controlled email input that:
 * 1. Checks format on blur,
 * 2. Debounces & calls a server-side validation,
 * 3. Displays an inline error in a `.message` div when invalid,
 * 4. Applies `red` class when invalid, `green` when valid.
 */
export default function RegisterEmailInput({
  value,
  onChange,
  onValidationChange
}: EmailInputProps) {
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  /** Holds the active debounce timer so we can clear/reset it. */
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** Clears the current debounce timer, if any. */
  const clearTimer = (): void => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  /**
   * Checks whether the supplied email matches the format regex.
   *
   * @param email - The email string to validate.
   * @returns `true` if the email format is valid.
   */
  const checkFormat = (email: string): boolean => EMAIL_REGEX.test(email)

  /** Debounced async validation against the server. */
  const startDebouncedValidation = useCallback(
    (email: string): void => {
      clearTimer()
      timer.current = setTimeout(async () => {
        if (!checkFormat(email)) return
        const result = await validateEmailAction(email)
        if (result.valid) {
          setError(null)
          setIsValid(true)
          onValidationChange(true)
        } else {
          setError(result.message || 'Invalid email')
          setIsValid(false)
          onValidationChange(false)
        }
      }, 500)
    },
    [onValidationChange]
  )

  /**
   * Handle blur: reset format errors, then
   * - if empty: do nothing
   * - if format invalid: show error
   */
  const handleBlur = useCallback(
    (e: FocusEvent<HTMLInputElement>): void => {
      const email = e.target.value.trim()

      if (!email) {
        setError(null)
        setIsValid(false)
        onValidationChange(false)
        return
      }

      if (!checkFormat(email)) {
        setError('Invalid email')
        setIsValid(false)
        onValidationChange(false)
      }
    },
    [onValidationChange]
  )

  /**
   * Handle input change: propagate value, clear previous validation state,
   * and (debounced) start server-side validation if the format looks valid.
   */
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      const next = e.target.value.toLowerCase().trim()
      onChange(next)

      // Reset any existing validation state.
      if (error) setError(null)
      if (isValid) setIsValid(false)
      onValidationChange(false)

      // Kick off a debounced server validation attempt.
      if (next) startDebouncedValidation(next)
      else clearTimer()
    },
    [error, isValid, onChange, onValidationChange, startDebouncedValidation]
  )

  return (
    <div className="form-input">
      <p>Email</p>
      <input
        className={error ? 'red' : isValid ? 'green' : ''}
        type="email"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={!!error}
        placeholder="tim@apple.com"
      />
      <div className={`message${error ? ' visible' : ''}`}>{error}</div>
    </div>
  )
}
