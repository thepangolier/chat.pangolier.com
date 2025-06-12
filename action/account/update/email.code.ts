'use server'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Payload for updating whether an email code (2FA) is required for login.
 *
 * @property requireEmailCode - When true, the user must provide a code sent to their email during authentication.
 */
export interface UpdateEmailCodeRequest {
  /** Flag indicating if email code requirement should be enabled or disabled. */
  requireEmailCode?: boolean
}

/**
 * Updates the two-factor authentication setting requiring an email code for the authenticated account.
 *
 * @param data - An object containing the `requireEmailCode` flag to update.
 * @returns A promise resolving to a {@link GenericResponse} indicating success or failure:
 *   - `ok`: true if the update succeeded, false otherwise.
 *   - `message`: a human-readable description of the result.
 */
export async function updateEmailCodeAction(
  data: UpdateEmailCodeRequest
): Promise<GenericResponse> {
  try {
    const session = await getSession()
    const accountId = session.account?.id

    if (!accountId) {
      return { ok: false, message: 'Not authenticated' }
    }

    const updateData: Partial<UpdateEmailCodeRequest> = {}
    if (data.requireEmailCode !== undefined) {
      updateData.requireEmailCode = data.requireEmailCode
    }

    if (Object.keys(updateData).length === 0) {
      return { ok: false, message: 'No fields to update' }
    }

    const account = await prisma.account.update({
      where: { id: accountId },
      data: updateData
    })

    session.account = account
    await session.save()

    return { ok: true, message: '2FA settings updated successfully' }
  } catch (error) {
    console.error('Error updating 2FA settings:', error)
    return { ok: false, message: 'Failed to update 2FA settings' }
  }
}
