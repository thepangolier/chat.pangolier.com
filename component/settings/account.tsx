'use client'
import '@scss/app/sso.scss'
import Image from 'next/image'
import { useMemo } from 'react'
import getAccount from '@action/account/session'
import GithubLogo from '@assets/img/brand/github.svg'
import GoogleLogo from '@assets/img/brand/google.webp'
import ChangeEmail from '@component/settings/account/email'
import type { SSOAction } from '@component/shared/sso'
import GithubSSO from '@component/shared/sso/github'
import GoogleSSO from '@component/shared/sso/google'
import { useSession } from '@context/session'

export default function AccountSettings() {
  const { account, setAccount } = useSession()

  const changeCopy = useMemo(() => {
    if (account.email && account.googleUrl) {
      return (
        <p>
          Your current email address is: <strong>{account.email}</strong>
        </p>
      )
    } else {
      return null
    }
  }, [account])

  const google = useMemo(() => {
    if (account.googleId) {
      return {
        header: 'Login with Google Enabled',
        action: 'disconnect' as SSOAction,
        copy: 'Disconnect Google',
        async onSuccess() {
          const { result } = await getAccount()
          if (!result) return
          setAccount(result)
        }
      }
    } else {
      return {
        header: 'Connect to enable Google Login',
        action: 'connect' as SSOAction,
        copy: 'Connect Google',
        async onSuccess() {
          const { result } = await getAccount()
          if (!result) return
          setAccount(result)
        }
      }
    }
  }, [account, setAccount])

  const github = useMemo(() => {
    if (account.githubId) {
      return {
        header: 'Login with Github Enabled',
        action: 'disconnect' as SSOAction,
        copy: 'Disconnect Github',
        async onSuccess() {
          const { result } = await getAccount()
          if (!result) return
          setAccount(result)
        }
      }
    } else {
      return {
        header: 'Connect to enable Github Login',
        action: 'connect' as SSOAction,
        copy: 'Connect Github',
        async onSuccess() {
          const { result } = await getAccount()
          if (!result) return
          setAccount(result)
        }
      }
    }
  }, [account, setAccount])

  return (
    <div className="settings-content">
      <div className="settings-card">
        <h2>Connected Accounts</h2>
        <div className="settings-sso">
          <h3>
            <Image src={GoogleLogo} alt="Google Logo" />
            {google.header}
          </h3>
          <GoogleSSO
            text={google.copy}
            action={google.action}
            onSuccess={google.onSuccess}
          />
        </div>

        <div className="settings-sso">
          <h3>
            <Image src={GithubLogo} alt="Github Logo" />
            {github.header}
          </h3>
          <GithubSSO
            text={github.copy}
            action={github.action}
            redirect="settings"
            onSuccess={github.onSuccess}
          />
        </div>

        <h3>Change Your Email Address</h3>
        <p>
          Changing your email address will disconnect your account from your
          Google account.
        </p>
        {changeCopy}

        <ChangeEmail />
      </div>
    </div>
  )
}
