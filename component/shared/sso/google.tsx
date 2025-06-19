'use client'
import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  GoogleDisconnectAction,
  GoogleLoginAction
} from '@action/account/sso/google'
import GoogleLogo from '@assets/img/brand/google.webp'
import { IconSpinner } from '@component/shared/icon'
import type { SSOProps } from '@component/shared/sso'
import { type TokenResponse, useGoogleLogin } from '@react-oauth/google'

export default function GoogleSSO({
  loading = false,
  text = 'Login with Google',
  action = 'connect',
  onSuccess
}: SSOProps) {
  const [isLoading, setIsLoading] = useState(false)
  const login = useGoogleLogin({
    scope: 'openid email profile',
    async onSuccess(tokenResponse: TokenResponse) {
      setIsLoading(true)
      const payload = await GoogleLoginAction(tokenResponse)
      if (payload.ok) {
        toast.success(payload.message)
        onSuccess()
      } else {
        toast.error(payload.message)
      }
      setIsLoading(false)
    },
    onError(error) {
      toast.error(error.error_description || 'Failed to login with Google')
      setIsLoading(false)
    },
    flow: 'implicit'
  })

  return (
    <button
      id="google"
      disabled={loading || isLoading}
      onClick={async () => {
        setIsLoading(true)
        if (action === 'connect' || action === 'login') {
          await login()
        } else {
          const payload = await GoogleDisconnectAction()
          if (payload.ok) {
            toast.success(payload.message)
            onSuccess()
          } else {
            toast.error(payload.message)
          }
        }
        setIsLoading(false)
      }}
    >
      {loading || isLoading ? (
        <IconSpinner />
      ) : (
        <>
          <Image src={GoogleLogo} alt="Google Logo" priority />
          {text}
        </>
      )}
    </button>
  )
}
