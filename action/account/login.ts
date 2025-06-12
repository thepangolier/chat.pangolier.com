'use server'
import prisma from 'prisma/client'
import { verifyPassword } from '@action/account/util/password'
import { send2FACode } from '@action/notification'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Properties required to perform a login.
 *
 * @property email    - The user's email address.
 * @property password - The user's plaintext password to verify.
 */
export interface LoginProps {
  /** The user's email address. */
  email: string
  /** The user's plaintext password. */
  password: string
}

/**
 * Authenticates a user by email and password, triggers 2FA if configured,
 * and establishes a session.
 *
 * @param props.email    - The user's email address.
 * @param props.password - The user's plaintext password to verify.
 * @returns A promise resolving to a GenericResponse:
 *   - `{ ok: true, message: '2fa required' }` if 2FA was sent,
 *   - `{ ok: true, message: 'User logged in successfully' }` on full login,
 *   - `{ ok: false, message: string }` on any failure.
 */
export default async function loginAction({
  email,
  password
}: LoginProps): Promise<GenericResponse> {
  try {
    // Basic input validation
    if (!email || !password) {
      return { ok: false, message: 'Email and password are required' }
    }

    // Lookup user
    const existingAccount = await prisma.account.findUnique({
      where: { email }
    })
    if (!existingAccount) {
      return { ok: false, message: 'User not found' }
    }

    // Verify password
    const isPasswordValid = await verifyPassword(
      existingAccount.password!,
      password
    )
    if (!isPasswordValid) {
      return { ok: false, message: 'Invalid password' }
    }

    // Get or create session
    const session = await getSession()

    // Handle 2FA flow
    if (existingAccount.requireEmailCode) {
      await send2FACode(existingAccount)
      session.verifyId = existingAccount.id
      await session.save()
      return { ok: true, message: '2fa required' }
    }

    // Complete login
    session.account = existingAccount
    await session.save()
    return { ok: true, message: 'User logged in successfully' }
  } catch (error) {
    console.error('Error logging in user:', error)
    return { ok: false, message: 'Failed to log in user' }
  }
}
