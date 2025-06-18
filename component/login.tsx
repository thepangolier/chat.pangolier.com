'use client'
import '@scss/app/sso.scss'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import loginAction from '@action/account/login'
import logo from '@assets/img/logo.png'
import { IconSpinner } from '@component/shared/icon'
import GithubSSO from '@component/shared/sso/github'
import GoogleSSO from '@component/shared/sso/google'
import { title } from '@util/metadata'

export default function LoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="login-card">
      <div className="login-copy">
        <div className="login-brand">
          <Image src={logo} alt="Logo" />
          <h2>Sign In</h2>
        </div>
        <p>Sign in to {title}</p>
      </div>
      <div className="login-forms">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!email || !password) return

            startTransition(async () => {
              const result = await loginAction({
                email,
                password
              })

              if (result.ok) {
                if (result.message.includes('2fa')) {
                  router.push('/verify')
                } else {
                  router.push('/chat')
                }
              } else {
                toast.error(result.message || 'Login failed')
              }
            })
          }}
        >
          <p>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <p>Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="submit-button"
            disabled={isPending || !email || !password}
          >
            {isPending ? <IconSpinner /> : 'Sign In'}
          </button>
        </form>
        <div className="login-divider">
          <div className="login-divider-line"></div>
          <p>or</p>
          <div className="login-divider-line"></div>
        </div>
        <div className="login-sso">
          <GoogleSSO
            text="Login with Google"
            action="login"
            onSuccess={() => router.push('/chat')}
          />
          <GithubSSO
            text="Login with Github"
            action="login"
            onSuccess={() => router.push('/chat')}
          />
        </div>
      </div>
      <Link href="/register">Don&apos;t have an account? Register here.</Link>
    </div>
  )
}
