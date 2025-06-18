'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Properties required to verify a user's email-based code.
 *
 * @property code - The verification code sent to the user's email.
 */
export interface VerifyProps {
  /** The code sent to the user's email for verification. */
  code: string
}

/**
 * Validates an email verification code for the current session,
 * clears the code on the account, and establishes the authenticated session.
 *
 * @param props.code - The email verification code to validate.
 * @returns A promise resolving to a GenericResponse:
 *   - `ok: true` and a success message when verification succeeds,
 *   - `ok: false` and an error message on any failure.
 */
export default async function verifyAction({
  code
}: VerifyProps): Promise<GenericResponse> {
  try {
    // Ensure a code was provided
    if (!code.trim()) {
      return { ok: false, message: 'Verification code is required' }
    }

    const session = await getSession()
    const rawVerifyId = session.verifyId
    const accountId = rawVerifyId ? String(rawVerifyId) : ''

    // Ensure the user is in the middle of a verification flow
    if (!accountId) {
      return { ok: false, message: 'Not authenticated for verification' }
    }

    // Lookup the account to verify
    const account = await prisma.account.findUnique({
      where: { id: accountId }
    })
    if (!account) {
      return { ok: false, message: 'User not found' }
    }

    // Validate the provided code
    if (!account.emailCode || account.emailCode !== code) {
      return { ok: false, message: 'Invalid verification code' }
    }

    // Clear the emailCode and finalize login
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { emailCode: null }
    })

    session.account = updatedAccount
    session.verifyId = undefined
    await session.save()

    return { ok: true, message: 'User verified successfully' }
  } catch (error) {
    console.error('Error verifying user:', error)
    return { ok: false, message: 'Failed to verify user' }
  }
}
