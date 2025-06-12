'use server'
import prisma from 'prisma/client'
import { hashPassword, verifyPassword } from '@action/account/util/password'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'
import { validatePassword } from '@util/validation'

/**
 * Payload for resetting the password of the authenticated account.
 *
 * @property currentPassword      - The account's existing password for verification.
 * @property newPassword          - The new desired password (must meet strength requirements).
 * @property confirmNewPassword   - Confirmation of the new password; must match newPassword.
 */
export interface ResetPasswordRequest {
  /** The account's current password. */
  currentPassword: string
  /** The new password to set. */
  newPassword: string
  /** Confirmation of the new password. */
  confirmNewPassword: string
}

/**
 * Resets the password for the current session's account after verifying the existing password.
 *
 * @param data - An object containing currentPassword, newPassword, and confirmNewPassword.
 * @returns A promise resolving to a {@link GenericResponse} with:
 *   - ok: indicates overall success or failure of the reset operation.
 *   - message: descriptive result or error message for the caller.
 */
export async function resetPasswordAction(
  data: ResetPasswordRequest
): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    if (data.newPassword !== data.confirmNewPassword) {
      return { ok: false, message: 'New passwords do not match' }
    }

    const passwordValidation = validatePassword(data.newPassword)
    if (!passwordValidation.valid) {
      return {
        ok: false,
        message: passwordValidation.message ?? 'Invalid password'
      }
    }

    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { password: true }
    })

    if (!account) {
      return { ok: false, message: 'Account not found' }
    }

    if (!account.password) {
      return {
        ok: false,
        message: 'No existing password found; please set a password first.'
      }
    }

    const isCurrentValid = await verifyPassword(
      account.password,
      data.currentPassword
    )
    if (!isCurrentValid) {
      return { ok: false, message: 'Current password is incorrect' }
    }

    const hashed = await hashPassword(data.newPassword)
    const updatedAccount = await prisma.account.update({
      where: { id: accountId },
      data: { password: hashed }
    })

    session.account = updatedAccount
    await session.save()

    return { ok: true, message: 'Password reset successfully' }
  } catch (error) {
    console.error('Error resetting password:', error)
    return {
      ok: false,
      message: 'Failed to reset password. Please try again.'
    }
  }
}
