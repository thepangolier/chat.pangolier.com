'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import adminLoginAction from '@action/admin/login'
import logo from '@assets/img/logo.png'
import { IconSpinner } from '@component/shared/icon'

export default function AdminLoginForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="login-card">
      <div className="login-copy">
        <div className="login-brand">
          <Image src={logo} alt="Logo" />
          <h2>Admin Login</h2>
        </div>
      </div>
      <div className="login-forms">
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!email || !password) return

            startTransition(async () => {
              const result = await adminLoginAction({
                email,
                password
              })

              if (result.ok) {
                router.push('/admin')
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
      </div>
    </div>
  )
}
