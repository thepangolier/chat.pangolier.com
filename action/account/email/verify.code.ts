'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Parameters required to verify the email update code.
 */
export interface VerifyCodeProps {
  /** The code sent to the user's email for verification. */
  code: string
}

/**
 * Validates the provided code against the stored target code and updates the account's email when successful.
 * Clears temporary email and code fields upon completion.
 *
 * @param props - Object containing the verification code.
 * @param props.code - The code to validate for the email update.
 * @returns A promise resolving to a {@link GenericResponse} that indicates if the code was valid and the email was updated.
 */
export default async function verifyCodeAction({
  code
}: VerifyCodeProps): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId }
    })

    if (!existingAccount) {
      return { ok: false, message: 'Account does not exist' }
    }

    const { targetCode, targetEmail } = existingAccount

    if (!targetCode || targetCode !== code || !targetEmail) {
      return { ok: false, message: 'Invalid or expired code' }
    }

    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: {
        email: targetEmail,
        targetEmail: null,
        targetCode: null,
        googleId: null,
        googleUrl: null
      }
    })

    session.account = updatedAccount
    await session.save()

    return { ok: true, message: 'Email verified and updated successfully' }
  } catch (error) {
    console.error('Error verifying email update code:', error)
    return { ok: false, message: 'Failed to verify email update code' }
  }
}
