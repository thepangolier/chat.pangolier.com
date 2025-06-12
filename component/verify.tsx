'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { toast } from 'react-toastify'
import verifyAction from '@action/account/verify'
import logo from '@assets/img/logo.png'
import { IconSpinner } from '@component/shared/icon'

export default function VerifyForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [code, setCode] = useState('')

  return (
    <div className="login-card">
      <div className="login-copy">
        <div className="login-brand">
          <Image src={logo} alt="Logo" />
          <h2>Verify</h2>
        </div>
        <p>A code has been sent to your email address</p>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            if (!code) return

            startTransition(async () => {
              const result = await verifyAction({ code })

              if (result.ok) {
                router.push('/app')
              } else {
                toast.error(result.message)
              }
            })
          }}
          className="form"
        >
          <div className="form-field">
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="text"
              onChange={(e) => setCode(e.target.value)}
              value={code}
              placeholder="Enter verification code"
            />
          </div>

          <button type="submit" disabled={isPending}>
            {isPending ? <IconSpinner /> : 'Verify'}
          </button>
        </form>

        <Link href="/login">Wrong account? Sign in again here</Link>
      </div>
    </div>
  )
}
