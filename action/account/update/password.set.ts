'use server'
import prisma from 'prisma/client'
import { hashPassword } from '@action/account/util/password'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Payload for setting a new password for the authenticated account.
 *
 * @property newPassword - The new password to set (must meet strength requirements).
 * @property confirmPassword - Confirmation of the new password; must match newPassword.
 */
export interface SetPasswordRequest {
  /** The new desired password. */
  newPassword: string
  /** Confirmation of the new password. */
  confirmPassword: string
}

/**
 * Sets a new password for the current session's account, if no password is already set.
 *
 * @param data - The password payload containing the new and confirmation passwords.
 * @returns A promise resolving to a {@link GenericResponse} indicating success or failure.
 */
export async function setPasswordAction(
  data: SetPasswordRequest
): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    if (data.newPassword !== data.confirmPassword) {
      return { ok: false, message: 'Passwords do not match' }
    }

    if (data.newPassword.length < 8) {
      return {
        ok: false,
        message: 'Password must be at least 8 characters long'
      }
    }

    const existingAccount = await prisma.account.findUnique({
      where: { id: accountId },
      select: { password: true }
    })

    if (!existingAccount) {
      return { ok: false, message: 'Account not found' }
    }

    if (existingAccount.password) {
      return { ok: false, message: 'Password is already set for this account' }
    }

    const hashedPassword = await hashPassword(data.newPassword)

    const account = await prisma.account.update({
      where: { id: accountId },
      data: { password: hashedPassword }
    })

    session.account = account
    await session.save()

    return { ok: true, message: 'Password set successfully' }
  } catch (error) {
    console.error('Error setting password:', error)
    return {
      ok: false,
      message: 'Failed to set password. Please try again.'
    }
  }
}
