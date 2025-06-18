import type { NextRequest } from 'next/server'
import prisma from 'prisma/client'
import getSession from '@util/session'

/**
 * Response returned by GitHub's OAuth token endpoint.
 */
export interface GithubOauthResponse {
  /** Access token to authenticate API requests. */
  access_token: string
  /** Error code returned by the OAuth endpoint, if any. */
  error: string
  /** Detailed description of the error, if any. */
  error_description: string
}

/**
 * GitHub user profile information fetched from the GitHub API.
 */
export interface GithubUserResponse {
  /** Unique numeric ID of the GitHub user. */
  id: number
  /** URL of the user's avatar image. */
  avatar_url: string
  /** API URL for the user's profile. */
  url: string
  /** HTML URL for the user's profile page. */
  html_url: string
  /** Display name of the user. */
  name: string
  /** Public email address of the user. */
  email: string
  /** Biography text of the user. */
  bio: string
}

/**
 * Next.js route handler for GitHub OAuth callback.
 * It exchanges the authorization code for an access token,
 * fetches the user's GitHub profile, and links or creates a local account.
 * Upon success, the user session is updated and the request is redirected.
 *
 * @param req - The incoming Next.js request containing the OAuth code and optional redirect path.
 * @returns A Next.js response redirecting the user to the appropriate path or a JSON error.
 */
export async function GET(req: NextRequest) {
  const session = await getSession()
  const { searchParams } = req.nextUrl

  try {
    const code = searchParams.get('code')
    const pathParam = searchParams.get('path') as 'chat' | 'settings'
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    const redirectPath =
      pathParam === 'chat' ? `${baseUrl}/chat` : `${baseUrl}/chat/settings`

    console.log('Will redirect to', redirectPath)

    if (!code) {
      return Response.redirect(redirectPath)
    }

    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_SECRET,
          code
        })
      }
    )

    const {
      access_token,
      error: tokenError,
      error_description
    } = (await tokenResponse.json()) as GithubOauthResponse

    if (tokenError) {
      console.error('GitHub OAuth error:', tokenError, error_description)
    }

    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        Accept: 'application/json'
      }
    })

    const user = (await userResponse.json()) as GithubUserResponse
    const githubId = String(user.id)
    const githubUrl = `https://github.com/${githubId}`

    let account = await prisma.account.findFirst({
      where: { OR: [{ email: user.email }, { githubId }] }
    })

    if (account) {
      if (!account.githubId) {
        account = await prisma.account.update({
          where: { id: account.id },
          data: { githubId, githubUrl }
        })
      }
    } else {
      account = await prisma.account.create({
        data: {
          email: user.email,
          name: user.name,
          bio: user.bio,
          photo: user.avatar_url,
          githubId,
          githubUrl
        }
      })
    }

    session.account = account
    await session.save()

    return Response.redirect(redirectPath)
  } catch (error) {
    console.error('Error in GitHub OAuth callback route:', error)
    return Response.json({ status: 'ERROR', error }, { status: 500 })
  }
}
