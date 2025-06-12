'use client'
import Image from 'next/image'
import { useCallback } from 'react'
import { toast } from 'react-toastify'
import { GitHubDisconnectAction } from '@action/account/sso/github'
import GithubLogo from '@assets/img/brand/github.svg'
import { IconSpinner } from '@component/shared/icon'
import type { SSOProps } from '@component/shared/sso'

/*
 * Builds the GitHub OAuth2 authorization URL.
 *
 * @param redirectPath - The app‐relative path to return to after auth (e.g. "/app/settings").
 * @returns A full GitHub OAuth2 URL that will send the user to GitHub's consent page.
 */
export function getGitHubAuthUrl(redirectPath: 'app' | 'settings'): string {
  const rootUrl = 'https://github.com/login/oauth/authorize'
  const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID as string
  const appUrl = process.env.NEXT_PUBLIC_APP_URL as string

  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GITHUB_CLIENT_ID is not defined')
  }
  if (!appUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not defined')
  }

  const encodedPath = encodeURIComponent(redirectPath || '/app')
  const redirectUri = `${appUrl}/api/sso/github?path=${encodedPath}`

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user'
  })

  return `${rootUrl}?${params.toString()}`
}

export interface GithubSSOProps extends SSOProps {
  redirect?: 'app' | 'settings'
}

export default function GithubSSO({
  loading = false,
  text = 'Login with Github',
  action = 'connect',
  redirect = 'app',
  onSuccess
}: GithubSSOProps) {
  const githubRedirect = useCallback(() => {
    window.location.href = getGitHubAuthUrl(redirect)
  }, [redirect])

  return (
    <button
      id="github"
      disabled={loading}
      onClick={async () => {
        if (action === 'connect' || action === 'login') {
          githubRedirect()
        } else {
          const payload = await GitHubDisconnectAction()
          if (payload.ok) {
            toast.success(payload.message)
            onSuccess()
          } else {
            toast.error(payload.message)
          }
        }
      }}
    >
      {loading ? (
        <IconSpinner />
      ) : (
        <>
          <Image src={GithubLogo} alt="Github Logo" />
          {text}
        </>
      )}
    </button>
  )
}
