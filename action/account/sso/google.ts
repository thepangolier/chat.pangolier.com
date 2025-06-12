'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import type { TokenResponse } from '@react-oauth/google'
import getSession from '@util/session'

/**
 * Represents the user profile information returned by Google's userinfo endpoint.
 */
export interface GoogleUserInfo {
  /** The unique Google user ID (sub). */
  sub: string
  /** The user's email address. */
  email: string
  /** The user's display name. */
  name: string
  /** URL of the user's profile picture. */
  picture: string
}

/**
 * Links or creates a local account using Google OAuth.
 * If an existing account with the same email or Google ID is found, it will be updated to
 * include the Google ID; otherwise, a new account record is created.
 * Upon success, the session is updated with the authenticated account.
 *
 * @param tokenResponse - The OAuth token response containing the access_token.
 * @returns A promise resolving to a {@link GenericResponse} indicating the outcome of the operation.
 */
export async function GoogleLoginAction(
  tokenResponse: TokenResponse
): Promise<GenericResponse> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
    })

    const profile = (await res.json()) as GoogleUserInfo

    let account = await prisma.account.findFirst({
      where: {
        OR: [{ email: profile.email }, { googleId: profile.sub }]
      }
    })

    if (account) {
      if (!account.googleId) {
        if (account.email !== profile.email) {
          return { ok: false, message: 'Email addresses do not match' }
        }
        account = await prisma.account.update({
          where: { id: account.id },
          data: { googleId: profile.sub, googleUrl: profile.email }
        })
      }
    } else {
      account = await prisma.account.create({
        data: {
          email: profile.email,
          name: profile.name,
          googleId: profile.sub,
          googleUrl: profile.email,
          photo: profile.picture
        }
      })
    }

    const session = await getSession()
    session.account = account
    await session.save()

    return { ok: true, message: 'Google connected successfully' }
  } catch (error) {
    console.error('Error connecting Google:', error)
    return { ok: false, message: 'Error connecting Google' }
  }
}

/**
 * Disconnects the Google OAuth link from the current session's account.
 * The Google ID and URL fields are cleared from the account record,
 * and the session is updated accordingly.
 *
 * @returns A promise resolving to a {@link GenericResponse} indicating the outcome of the operation.
 */
export async function GoogleDisconnectAction(): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: { googleId: null, googleUrl: null }
    })

    session.account = account
    await session.save()

    return { ok: true, message: 'Google disconnected successfully' }
  } catch (error) {
    console.error('Error disconnecting Google:', error)
    return { ok: false, message: 'Error disconnecting Google' }
  }
}
