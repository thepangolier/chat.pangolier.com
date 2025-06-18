'use client'
import '@scss/app/sso.scss'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import registerAction from '@action/account/register'
import logo from '@assets/img/logo.png'
import { IconSpinner } from '@component/shared/icon'
import GithubSSO from '@component/shared/sso/github'
import GoogleSSO from '@component/shared/sso/google'
import RegisterEmailInput from '@component/shared/validation/email'
import RegisterPasswordInput from '@component/shared/validation/password'
import { title } from '@util/metadata'

export default function RegisterForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)

  return (
    <div className="login-card">
      <div className="login-copy">
        <div className="login-brand">
          <Image src={logo} alt="Logo" priority />
          <h2>Sign Up</h2>
        </div>
        <p>Sign up for {title}</p>
      </div>
      <div className="login-forms">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!emailValid || !passwordValid) return

            startTransition(async () => {
              const result = await registerAction({
                email,
                password,
                confirmPassword
              })

              if (result.ok) {
                router.push('/chat')
              } else {
                toast.error(result.message || 'Registration failed')
              }
            })
          }}
        >
          <RegisterEmailInput
            value={email}
            onChange={setEmail}
            onValidationChange={setEmailValid}
          />
          <RegisterPasswordInput
            password={password}
            confirmPassword={confirmPassword}
            onPasswordChange={setPassword}
            onConfirmPasswordChange={setConfirmPassword}
            onValidationChange={setPasswordValid}
          />

          <div className="register-checkbox">
            <input type="checkbox" id="terms" required className="checkbox" />
            <label htmlFor="terms">
              By clicking sign up, you agree to the{' '}
              <Link href="/terms" className="link">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="link">
                Privacy Policy
              </Link>{' '}
              for the Pangolier Chat App.
            </label>
          </div>

          <button
            type="submit"
            disabled={!emailValid || !passwordValid || isPending}
            className="submit-button"
          >
            {isPending ? <IconSpinner /> : 'Sign Up'}
          </button>
        </form>

        <div className="login-divider">
          <div className="login-divider-line"></div>
          <p>or</p>
          <div className="login-divider-line"></div>
        </div>

        <div className="login-sso">
          <GoogleSSO
            text="Register with Google"
            action="login"
            onSuccess={() => router.push('/chat')}
          />
          <GithubSSO
            text="Register with Github"
            action="login"
            onSuccess={() => router.push('/chat')}
          />
        </div>
      </div>
      <Link href="/login">Already have an account? Login here.</Link>
    </div>
  )
}
