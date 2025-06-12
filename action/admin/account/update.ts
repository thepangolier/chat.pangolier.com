'use server'
import { type Account, Prisma } from 'prisma/client'
import prisma from 'prisma/client'
import type { GenericResponse } from '@action/types'
import getSession from '@util/session'

/**
 * Payload for specifying which account to update and the changes to apply.
 */
export interface UpdateAccountRequest {
  /** Unique selector identifying the account to be updated. */
  where: Prisma.AccountWhereUniqueInput
  /** Fields and values to apply to the selected account. */
  data: Prisma.AccountUpdateInput
}

/**
 * Response returned after attempting to update an account.
 */
export interface UpdateAccountResponse extends GenericResponse {
  /** The updated account record when the operation succeeds. */
  result?: Account
}

/**
 * Updates an existing account record when invoked by an administrator.
 * It verifies admin privileges, applies the update, and returns the modified account.
 *
 * @param request - Object containing the `where` selector and `data` payload for the update.
 * @returns A promise that resolves to an {@link UpdateAccountResponse} indicating success or failure.
 */
export async function updateAccountAction(
  request: UpdateAccountRequest
): Promise<UpdateAccountResponse> {
  try {
    const session = await getSession()

    if (!session?.admin) {
      return { ok: false, message: 'Not authorized' }
    }

    const { where, data: updateData } = request
    const updatedAccount = await prisma.account.update({
      where,
      data: updateData
    })

    return {
      ok: true,
      message: 'Account updated successfully',
      result: updatedAccount
    }
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    ) {
      return { ok: false, message: 'Account not found' }
    }

    console.error('Error updating account:', error)
    return { ok: false, message: 'Failed to update account' }
  }
}
